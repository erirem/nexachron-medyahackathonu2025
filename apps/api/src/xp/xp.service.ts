import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, XpEventType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

const ISTANBUL_OFFSET_MINUTES = 180;
const DAILY_LOGIN_XP = 15;
const QUIZ_CORRECT_XP = 10;
const POPULAR_NEWS_XP = 5;
const POPULAR_NEWS_DAILY_CAP = 25;

export interface XpEventResult {
  xpDelta: number;
  streak: {
    added: boolean;
    current: number;
  };
  limitReached?: boolean;
}

interface QuizRewardParams {
  userId: string;
  isCorrect: boolean;
  attemptId: string;
  quizId: string;
  selectedOptionId: string;
  now: Date;
}

interface DailyLoginParams {
  userId: string;
  now: Date;
}

interface PopularNewsParams {
  userId: string;
  now: Date;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class XpService {
  constructor(private readonly prisma: PrismaService) {}

  async handleDailyLogin(userId: string): Promise<XpEventResult> {
    const now = new Date();
    return this.prisma.$transaction((tx) =>
      this.applyDailyLogin(tx, { userId, now }),
    );
  }

  async handlePopularNews(
    userId: string,
    metadata?: Record<string, unknown>,
  ): Promise<XpEventResult> {
    const now = new Date();
    return this.prisma.$transaction((tx) =>
      this.applyPopularNews(tx, { userId, now, metadata }),
    );
  }

  async applyQuizResult(
    tx: Prisma.TransactionClient,
    params: QuizRewardParams,
  ): Promise<XpEventResult> {
    const { userId, isCorrect, now, attemptId, quizId, selectedOptionId } =
      params;

    const progress = await this.ensureUserProgress(tx, userId);

    const xpDelta = isCorrect ? QUIZ_CORRECT_XP : 0;
    const streakAdded = isCorrect
      ? this.shouldIncrementStreak(progress.lastSeenDate, now)
      : false;

    const updated = await tx.userProgress.update({
      where: { userId },
      data: {
        xp: xpDelta ? { increment: xpDelta } : undefined,
        currentStreak: streakAdded ? { increment: 1 } : undefined,
        lastSeenDate: now,
        updatedAt: now,
      },
    });

    if (xpDelta > 0) {
      await tx.xpEvent.create({
        data: {
          userId,
          type: XpEventType.QUIZ_CORRECT,
          xpDelta,
          metadata: {
            attemptId,
            quizId,
            selectedOptionId,
            correct: isCorrect,
          },
        },
      });
    }

    return {
      xpDelta,
      streak: {
        added: streakAdded,
        current: updated.currentStreak,
      },
    };
  }

  async applyDailyLogin(
    tx: Prisma.TransactionClient,
    params: DailyLoginParams,
  ): Promise<XpEventResult> {
    const { userId, now } = params;
    const progress = await this.ensureUserProgress(tx, userId);

    const { start, end } = this.getIstanbulDayWindow(now);
    const existing = await tx.xpEvent.findFirst({
      where: {
        userId,
        type: XpEventType.DAILY_LOGIN,
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    });

    if (existing) {
      const updated = await tx.userProgress.update({
        where: { userId },
        data: {
          lastSeenDate: now,
          updatedAt: now,
        },
      });

      return {
        xpDelta: 0,
        streak: {
          added: false,
          current: updated.currentStreak,
        },
      };
    }

    const streakAdded = this.shouldIncrementStreak(progress.lastSeenDate, now);

    const updated = await tx.userProgress.update({
      where: { userId },
      data: {
        xp: { increment: DAILY_LOGIN_XP },
        currentStreak: streakAdded ? { increment: 1 } : undefined,
        lastSeenDate: now,
        updatedAt: now,
      },
    });

    await tx.xpEvent.create({
      data: {
        userId,
        type: XpEventType.DAILY_LOGIN,
        xpDelta: DAILY_LOGIN_XP,
      },
    });

    return {
      xpDelta: DAILY_LOGIN_XP,
      streak: {
        added: streakAdded,
        current: updated.currentStreak,
      },
    };
  }

  async applyPopularNews(
    tx: Prisma.TransactionClient,
    params: PopularNewsParams,
  ): Promise<XpEventResult> {
    const { userId, now, metadata } = params;
    await this.ensureUserProgress(tx, userId);

    const { start, end } = this.getIstanbulDayWindow(now);
    const aggregate = await tx.xpEvent.aggregate({
      _sum: { xpDelta: true },
      where: {
        userId,
        type: XpEventType.POPULAR_NEWS,
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    });

    const earnedToday = aggregate._sum.xpDelta ?? 0;
    const remaining = Math.max(0, POPULAR_NEWS_DAILY_CAP - earnedToday);

    if (remaining <= 0) {
      const progress = await tx.userProgress.findUnique({
        where: { userId },
        select: { currentStreak: true },
      });
      return {
        xpDelta: 0,
        streak: {
          added: false,
          current: progress?.currentStreak ?? 0,
        },
        limitReached: true,
      };
    }

    const xpDelta = Math.min(POPULAR_NEWS_XP, remaining);

    const updated = await tx.userProgress.update({
      where: { userId },
      data: {
        xp: { increment: xpDelta },
        updatedAt: now,
      },
    });

    await tx.xpEvent.create({
      data: {
        userId,
        type: XpEventType.POPULAR_NEWS,
        xpDelta,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    return {
      xpDelta,
      streak: {
        added: false,
        current: updated.currentStreak,
      },
      limitReached: xpDelta < POPULAR_NEWS_XP,
    };
  }

  async ensureUserProgress(
    tx: Prisma.TransactionClient | PrismaClient,
    userId: string,
  ) {
    return tx.userProgress.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  shouldIncrementStreak(lastSeen: Date | null | undefined, now: Date): boolean {
    if (!lastSeen) {
      return true;
    }

    const previousKey = this.computeIstanbulDayKey(lastSeen);
    const currentKey = this.computeIstanbulDayKey(now);
    return previousKey !== currentKey;
  }

  private getIstanbulDayWindow(now: Date) {
    const startKey = this.computeIstanbulDayKey(now);
    const [year, month, day] = startKey.split('-').map((part) => Number(part));
    const start = new Date(Date.UTC(year, month - 1, day));
    start.setUTCMinutes(start.getUTCMinutes() - ISTANBUL_OFFSET_MINUTES);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end };
  }

  private computeIstanbulDayKey(date: Date): string {
    const shifted = new Date(
      date.getTime() + ISTANBUL_OFFSET_MINUTES * 60 * 1000,
    );
    const year = shifted.getUTCFullYear();
    const month = String(shifted.getUTCMonth() + 1).padStart(2, '0');
    const day = String(shifted.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
