import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { QuizAttemptState, QuizStatus } from '@prisma/client';

import type { AnswerQuizResponse } from './quiz.service';

import { PrismaService } from '../prisma/prisma.service';
import { QuizService } from './quiz.service';

type TransactionHandler = Parameters<
  typeof PrismaService.prototype.$transaction
>[0];
type TransactionClient = TransactionHandler extends (
  client: infer Client,
  ...args: any[]
) => any
  ? Client
  : never;

describe('QuizService', () => {
  let service: QuizService;
  let transactionMock: jest.MockedFunction<
    typeof PrismaService.prototype.$transaction
  >;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: PrismaService,
          useValue: {
            quizAttempt: {
              findFirst: jest.fn(),
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            quiz: {
              findFirst: jest.fn(),
            },
            userProgress: {
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(QuizService);
    const prisma = moduleRef.get(PrismaService);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    transactionMock = prisma.$transaction as jest.MockedFunction<
      typeof PrismaService.prototype.$transaction
    >;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('answers a quiz attempt and awards streak/xp on happy path', async () => {
    const attempt = {
      id: 'attempt-1',
      userId: 'user-1',
      quizId: 'quiz-1',
      state: QuizAttemptState.CREATED,
      selectedOptionId: null,
      isCorrect: null,
      awardedXp: 0,
      streakIncremented: false,
      shuffleSeed: 1234,
      answeredAt: null,
      quiz: {
        id: 'quiz-1',
        type: 'ARTICLE',
        newsId: 'news-1',
        question: 'Which team won the final?',
        explanation: 'Because they scored the most goals',
        activeUntil: new Date(Date.now() + 60_000),
        status: QuizStatus.ACTIVE,
        options: [
          {
            id: 'opt-1',
            text: 'Team A',
            isCorrect: true,
            explanation: 'They scored 3 goals.',
            displayOrder: 0,
          },
          {
            id: 'opt-2',
            text: 'Team B',
            isCorrect: false,
            explanation: null,
            displayOrder: 1,
          },
        ],
      },
    };

    const tx = {
      quizAttempt: {
        findUnique: jest.fn().mockResolvedValue(attempt),
        update: jest
          .fn()
          .mockResolvedValue({ ...attempt, state: QuizAttemptState.ANSWERED }),
      },
      userProgress: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
        create: jest.fn().mockResolvedValue({
          userId: 'user-1',
          xp: 10,
          currentStreak: 1,
          lastSeenDate: new Date(),
        }),
      },
    } as unknown as TransactionClient;

    transactionMock.mockImplementation((handler) =>
      Promise.resolve().then(() => handler(tx) as AnswerQuizResponse),
    );

    const response = await service.answerQuiz('user-1', {
      attemptId: 'attempt-1',
      selectedOptionId: 'opt-1',
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const updateMock = tx.quizAttempt.update as jest.Mock;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const createMock = tx.userProgress.create as jest.Mock;

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'attempt-1' } }),
    );
    expect(createMock).toHaveBeenCalled();

    expect(response).toEqual({
      isCorrect: true,
      xp_delta: 10,
      streak_update: {
        added: true,
        current_streak: 1,
      },
      explanation: 'They scored 3 goals.',
      next_action: 'share',
    });
  });

  it('returns the stored result when the attempt was already answered', async () => {
    const attempt = {
      id: 'attempt-2',
      userId: 'user-1',
      quizId: 'quiz-1',
      state: QuizAttemptState.ANSWERED,
      selectedOptionId: 'opt-1',
      isCorrect: true,
      awardedXp: 10,
      streakIncremented: true,
      answeredAt: new Date(),
      shuffleSeed: 999,
      quiz: {
        id: 'quiz-1',
        type: 'ARTICLE',
        newsId: 'news-1',
        question: 'Which team won the final?',
        explanation: 'Because they scored the most goals',
        activeUntil: new Date(Date.now() + 60_000),
        status: QuizStatus.ACTIVE,
        options: [
          {
            id: 'opt-1',
            text: 'Team A',
            isCorrect: true,
            explanation: 'They scored 3 goals.',
            displayOrder: 0,
          },
          {
            id: 'opt-2',
            text: 'Team B',
            isCorrect: false,
            explanation: null,
            displayOrder: 1,
          },
        ],
      },
    };

    const tx = {
      quizAttempt: {
        findUnique: jest.fn().mockResolvedValue(attempt),
        update: jest.fn(),
      },
      userProgress: {
        findUnique: jest.fn().mockResolvedValue({
          userId: 'user-1',
          xp: 120,
          currentStreak: 5,
          lastSeenDate: new Date(),
        }),
        update: jest.fn(),
        create: jest.fn(),
      },
    } as unknown as TransactionClient;

    transactionMock.mockImplementation((handler) =>
      Promise.resolve().then(() => handler(tx) as AnswerQuizResponse),
    );

    await expect(
      service.answerQuiz('user-1', {
        attemptId: 'attempt-2',
        selectedOptionId: 'opt-2',
      }),
    ).rejects.toThrow(ConflictException);

    try {
      await service.answerQuiz('user-1', {
        attemptId: 'attempt-2',
        selectedOptionId: 'opt-2',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      expect((error as ConflictException).getResponse()).toMatchObject({
        isCorrect: true,
        xp_delta: 10,
        streak_update: {
          added: true,
          current_streak: 5,
        },
      });
    }
  });
});
