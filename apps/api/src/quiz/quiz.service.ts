import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, QuizAttemptState, QuizStatus } from '@prisma/client';

import { randomInt } from 'crypto';

import type { AnswerQuizDto } from './dto/answer-quiz.dto';

import type { GetNextQuizQueryDto } from './dto/get-next-quiz.dto';

import { PrismaService } from '../prisma/prisma.service';

import { XpService } from '../xp/xp.service';

type QuizWithOptions = Prisma.QuizGetPayload<{
  include: {
    options: {
      orderBy?: {
        displayOrder: 'asc';
      };
    };
  };
}>;

type AttemptWithQuiz = Prisma.QuizAttemptGetPayload<{
  include: {
    quiz: {
      include: {
        options: {
          orderBy?: {
            displayOrder: 'asc';
          };
        };
      };
    };
  };
}>;

export interface NextQuizResponse {
  attempt_id: string;

  quiz: {
    id: string;

    type: string;

    news_id: string | null;

    question: string;

    options: Array<{
      id: string;

      text: string;
    }>;

    active_until: string | null;
  };

  shuffle_seed: number | null;
}

export interface AnswerQuizResponse {
  isCorrect: boolean;

  xp_delta: number;

  streak_update: {
    added: boolean;

    current_streak: number;
  };

  explanation: string;

  next_action: 'share' | 'review';
}

@Injectable()
export class QuizService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xpService: XpService,
  ) {}

  async getNextQuiz(
    userId: string,

    query: GetNextQuizQueryDto,
  ): Promise<NextQuizResponse> {
    const existingAttempt = await this.prisma.quizAttempt.findFirst({
      where: {
        userId,

        state: QuizAttemptState.CREATED,
      },

      include: {
        quiz: {
          include: {
            options: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },

      orderBy: { createdAt: 'desc' },
    });

    if (existingAttempt) {
      throw new ConflictException(this.mapAttemptToPayload(existingAttempt));
    }

    const now = new Date();

    const requestedNewsId = query.newsId ?? query['news_id'];

    const candidateQuiz = await this.resolveNextQuiz(
      now,

      userId,

      requestedNewsId,
    );

    if (!candidateQuiz) {
      throw new NotFoundException('No active quiz available for the user.');
    }

    const shuffleSeed = this.generateShuffleSeed();

    await this.xpService.ensureUserProgress(this.prisma, userId);

    try {
      const attempt = await this.prisma.quizAttempt.create({
        data: {
          userId,

          quizId: candidateQuiz.id,

          shuffleSeed,
        },
      });

      return {
        attempt_id: attempt.id,

        quiz: this.mapQuiz(candidateQuiz),

        shuffle_seed: shuffleSeed,
      };
    } catch (error) {
      if (this.isPrismaKnownRequestError(error) && error.code === 'P2002') {
        const retryAttempt = await this.prisma.quizAttempt.findFirst({
          where: {
            userId,

            quizId: candidateQuiz.id,

            state: QuizAttemptState.CREATED,
          },

          include: {
            quiz: {
              include: {
                options: {
                  orderBy: { displayOrder: 'asc' },
                },
              },
            },
          },
        });

        if (retryAttempt) {
          throw new ConflictException(this.mapAttemptToPayload(retryAttempt));
        }
      }

      throw error;
    }
  }

  async answerQuiz(
    userId: string,

    dto: AnswerQuizDto,
  ): Promise<AnswerQuizResponse> {
    return this.prisma.$transaction(async (tx) => {
      const attempt = await tx.quizAttempt.findUnique({
        where: { id: dto.attemptId },

        include: {
          quiz: {
            include: { options: true },
          },
        },
      });

      if (!attempt || attempt.userId !== userId) {
        throw new BadRequestException('Attempt not found for this user.');
      }

      const quiz = attempt.quiz;

      const correctOption = quiz.options.find((option) => option.isCorrect);

      if (!correctOption) {
        throw new BadRequestException(
          'Quiz is misconfigured without a correct option.',
        );
      }

      if (attempt.state !== QuizAttemptState.CREATED) {
        const storedSelection = quiz.options.find(
          (option) => option.id === attempt.selectedOptionId,
        );

        const progressSnapshot = await tx.userProgress.findUnique({
          where: { userId },
        });

        throw new ConflictException({
          isCorrect: Boolean(attempt.isCorrect),

          xp_delta: attempt.awardedXp,

          streak_update: {
            added: attempt.streakIncremented,

            current_streak: progressSnapshot?.currentStreak ?? 0,
          },

          explanation: this.resolveExplanation(
            Boolean(attempt.isCorrect),

            storedSelection,

            correctOption,

            quiz.explanation,
          ),

          next_action: attempt.isCorrect ? 'share' : 'review',
        });
      }

      if (
        quiz.status !== QuizStatus.ACTIVE ||
        (quiz.activeUntil && quiz.activeUntil <= new Date())
      ) {
        throw new GoneException('Quiz is no longer active.');
      }

      const selectedOption = quiz.options.find(
        (option) => option.id === dto.selectedOptionId,
      );

      if (!selectedOption) {
        throw new BadRequestException(
          'Selected option does not belong to the quiz.',
        );
      }

      const now = new Date();

      const isCorrect = selectedOption.isCorrect;

      const xpResult = await this.xpService.applyQuizResult(tx, {
        userId,

        isCorrect,

        now,

        attemptId: attempt.id,

        quizId: attempt.quizId,

        selectedOptionId: selectedOption.id,
      });

      await tx.quizAttempt.update({
        where: { id: attempt.id },

        data: {
          state: QuizAttemptState.ANSWERED,

          selectedOptionId: selectedOption.id,

          isCorrect,

          awardedXp: xpResult.xpDelta,

          streakIncremented: xpResult.streak.added,

          answeredAt: now,
        },
      });

      const explanation = this.resolveExplanation(
        isCorrect,

        selectedOption,

        correctOption,

        quiz.explanation,
      );

      return {
        isCorrect,

        xp_delta: xpResult.xpDelta,

        streak_update: {
          added: xpResult.streak.added,

          current_streak: xpResult.streak.current,
        },

        explanation,

        next_action: isCorrect ? 'share' : 'review',
      };
    });
  }

  private async resolveNextQuiz(
    now: Date,

    userId: string,

    newsId?: string,
  ): Promise<QuizWithOptions | null> {
    const baseWhere: Prisma.QuizWhereInput = {
      status: QuizStatus.ACTIVE,

      OR: [{ activeUntil: null }, { activeUntil: { gt: now } }],

      attempts: {
        none: {
          userId,
        },
      },
    };

    if (newsId) {
      const targeted = await this.prisma.quiz.findFirst({
        where: {
          ...baseWhere,

          newsId,
        },

        include: {
          options: {
            orderBy: { displayOrder: 'asc' },
          },
        },

        orderBy: { createdAt: 'asc' },
      });

      if (targeted) {
        return targeted;
      }
    }

    return this.prisma.quiz.findFirst({
      where: baseWhere,

      include: {
        options: {
          orderBy: { displayOrder: 'asc' },
        },
      },

      orderBy: { createdAt: 'asc' },
    });
  }

  private mapQuiz(quiz: QuizWithOptions): NextQuizResponse['quiz'] {
    return {
      id: quiz.id,

      type: quiz.type.toLowerCase(),

      news_id: quiz.newsId ?? null,

      question: quiz.question,

      options: quiz.options.map((option) => ({
        id: option.id,

        text: option.text,
      })),

      active_until: quiz.activeUntil ? quiz.activeUntil.toISOString() : null,
    };
  }

  private mapAttemptToPayload(attempt: AttemptWithQuiz): NextQuizResponse {
    return {
      attempt_id: attempt.id,

      quiz: this.mapQuiz(attempt.quiz as QuizWithOptions),

      shuffle_seed: attempt.shuffleSeed ?? null,
    };
  }

  private isPrismaKnownRequestError(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError;
  }

  private generateShuffleSeed(): number {
    return randomInt(0, 100_000);
  }

  private resolveExplanation(
    isCorrect: boolean,

    selectedOption: { text: string; explanation: string | null } | undefined,

    correctOption: { text: string; explanation: string | null },

    fallbackExplanation?: string | null,
  ): string {
    if (isCorrect) {
      return (
        selectedOption?.explanation ??
        fallbackExplanation ??
        `Correct! ${correctOption.text} is the right answer.`
      );
    }

    return (
      correctOption.explanation ??
      fallbackExplanation ??
      `Not quite. The correct answer was: ${correctOption.text}.`
    );
  }
}
