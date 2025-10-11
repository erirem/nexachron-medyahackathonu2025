import { IsString, IsOptional, IsBoolean, IsUUID, IsNumber, Min, Max, IsEnum, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GameType, GameMode, GameStatus } from '../../core/entities/game.entity';
import { GameRoomStatus } from '../../core/entities/game-room.entity';

// Game Question DTO
export class GameQuestionDto {
  @ApiProperty({ description: 'Question ID', example: 'q1' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Question text', example: 'What is the capital of Turkey?' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'Answer options', example: ['Ankara', 'Istanbul', 'Izmir', 'Bursa'] })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ description: 'Correct answer', example: 'Ankara' })
  @IsString()
  correctAnswer: string;

  @ApiPropertyOptional({ description: 'Explanation for the answer' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ description: 'Difficulty level', enum: ['easy', 'medium', 'hard'], example: 'medium' })
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: 'easy' | 'medium' | 'hard';

  @ApiPropertyOptional({ description: 'Question category', example: 'geography' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Time limit in seconds', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(300)
  timeLimit?: number;
}

// Create Game DTO
export class CreateGameDto {
  @ApiProperty({ description: 'Game type', enum: GameType, example: GameType.QUIZ })
  @IsEnum(GameType)
  type: GameType;

  @ApiProperty({ description: 'Game mode', enum: GameMode, example: GameMode.SINGLE_PLAYER })
  @IsEnum(GameMode)
  mode: GameMode;

  @ApiProperty({ description: 'Game questions', type: [GameQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameQuestionDto)
  questions: GameQuestionDto[];

  @ApiPropertyOptional({ description: 'Time limit in seconds', example: 300 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(3600)
  timeLimit?: number;
}

// Update Game DTO
export class UpdateGameDto {
  @ApiPropertyOptional({ description: 'Game status', enum: GameStatus })
  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;

  @ApiPropertyOptional({ description: 'Current question index', example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentQuestionIndex?: number;
}

// Game Response DTO
export class GameResponseDto {
  @ApiProperty({ description: 'Game ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Game type', enum: GameType })
  type: GameType;

  @ApiProperty({ description: 'Game mode', enum: GameMode })
  mode: GameMode;

  @ApiProperty({ description: 'Game status', enum: GameStatus })
  status: GameStatus;

  @ApiProperty({ description: 'Game questions', type: [GameQuestionDto] })
  questions: GameQuestionDto[];

  @ApiProperty({ description: 'Current question index', example: 0 })
  currentQuestionIndex: number;

  @ApiPropertyOptional({ description: 'Time limit in seconds' })
  timeLimit?: number;

  @ApiProperty({ description: 'Game creator ID', format: 'uuid' })
  createdBy: string;

  @ApiProperty({ description: 'Game creation date', format: 'date-time' })
  createdAt: string;

  @ApiPropertyOptional({ description: 'Game start date', format: 'date-time' })
  startedAt?: string;

  @ApiPropertyOptional({ description: 'Game completion date', format: 'date-time' })
  completedAt?: string;

  @ApiProperty({ description: 'Total questions count', example: 10 })
  totalQuestions: number;

  @ApiProperty({ description: 'Game progress percentage', example: 25 })
  progress: number;

  @ApiProperty({ description: 'Is game active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Is game completed', example: false })
  isCompleted: boolean;

  @ApiProperty({ description: 'Can game start', example: true })
  canStart: boolean;

  @ApiProperty({ description: 'Can answer questions', example: true })
  canAnswer: boolean;

  @ApiProperty({ description: 'Is last question', example: false })
  isLastQuestion: boolean;

  @ApiProperty({ description: 'Remaining questions count', example: 8 })
  remainingQuestions: number;
}

// Create Game Room DTO
export class CreateGameRoomDto {
  @ApiProperty({ description: 'Game ID', format: 'uuid' })
  @IsUUID()
  gameId: string;

  @ApiProperty({ description: 'Room name', example: 'Quiz Champions' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Game type', enum: GameType })
  @IsEnum(GameType)
  gameType: GameType;

  @ApiProperty({ description: 'Maximum players', example: 8 })
  @IsNumber()
  @Min(2)
  @Max(20)
  maxPlayers: number;

  @ApiProperty({ description: 'Is private room', example: false })
  @IsBoolean()
  isPrivate: boolean;

  @ApiPropertyOptional({ description: 'Room password' })
  @IsOptional()
  @IsString()
  password?: string;
}

// Game Room Response DTO
export class GameRoomResponseDto {
  @ApiProperty({ description: 'Room ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Game ID', format: 'uuid' })
  gameId: string;

  @ApiProperty({ description: 'Room name', example: 'Quiz Champions' })
  name: string;

  @ApiProperty({ description: 'Game type', enum: GameType })
  gameType: GameType;

  @ApiProperty({ description: 'Maximum players', example: 8 })
  maxPlayers: number;

  @ApiProperty({ description: 'Current players', example: ['user1', 'user2'] })
  currentPlayers: string[];

  @ApiProperty({ description: 'Is private room', example: false })
  isPrivate: boolean;

  @ApiProperty({ description: 'Room status', enum: GameRoomStatus })
  status: GameRoomStatus;

  @ApiProperty({ description: 'Room creator ID', format: 'uuid' })
  createdBy: string;

  @ApiProperty({ description: 'Room creation date', format: 'date-time' })
  createdAt: string;

  @ApiPropertyOptional({ description: 'Room start date', format: 'date-time' })
  startedAt?: string;

  @ApiPropertyOptional({ description: 'Room completion date', format: 'date-time' })
  completedAt?: string;

  @ApiProperty({ description: 'Player count', example: 2 })
  playerCount: number;

  @ApiProperty({ description: 'Available slots', example: 6 })
  availableSlots: number;

  @ApiProperty({ description: 'Is room full', example: false })
  isFull: boolean;

  @ApiProperty({ description: 'Is room available', example: true })
  isAvailable: boolean;

  @ApiProperty({ description: 'Can join room', example: true })
  canJoin: boolean;

  @ApiProperty({ description: 'Can start room', example: true })
  canStart: boolean;

  @ApiProperty({ description: 'Is password protected', example: false })
  isPasswordProtected: boolean;
}

// Join Room DTO
export class JoinRoomDto {
  @ApiPropertyOptional({ description: 'Room password' })
  @IsOptional()
  @IsString()
  password?: string;
}

// Answer Question DTO
export class AnswerQuestionDto {
  @ApiProperty({ description: 'Question ID', example: 'q1' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Player answer', example: 'Ankara' })
  @IsString()
  answer: string;

  @ApiProperty({ description: 'Time spent in milliseconds', example: 15000 })
  @IsNumber()
  @Min(0)
  timeSpent: number;
}

// Game Answer Response DTO
export class GameAnswerResponseDto {
  @ApiProperty({ description: 'Answer ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Game ID', format: 'uuid' })
  gameId: string;

  @ApiProperty({ description: 'Player ID', format: 'uuid' })
  playerId: string;

  @ApiProperty({ description: 'Question ID', example: 'q1' })
  questionId: string;

  @ApiProperty({ description: 'Player answer', example: 'Ankara' })
  answer: string;

  @ApiProperty({ description: 'Is answer correct', example: true })
  isCorrect: boolean;

  @ApiProperty({ description: 'Time spent in milliseconds', example: 15000 })
  timeSpent: number;

  @ApiProperty({ description: 'XP earned', example: 10 })
  xpEarned: number;

  @ApiProperty({ description: 'Answer creation date', format: 'date-time' })
  createdAt: string;

  @ApiProperty({ description: 'Time spent in seconds', example: 15 })
  timeSpentSeconds: number;

  @ApiProperty({ description: 'Was answered quickly', example: true })
  wasAnsweredQuickly: boolean;

  @ApiProperty({ description: 'Speed bonus XP', example: 5 })
  speedBonus: number;

  @ApiProperty({ description: 'Total XP earned', example: 15 })
  totalXp: number;

  @ApiProperty({ description: 'Answer accuracy', example: 100 })
  accuracy: number;

  @ApiProperty({ description: 'Answer efficiency', example: 100 })
  efficiency: number;
}

// Game Result Response DTO
export class GameResultResponseDto {
  @ApiProperty({ description: 'Result ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Game ID', format: 'uuid' })
  gameId: string;

  @ApiProperty({ description: 'Player ID', format: 'uuid' })
  playerId: string;

  @ApiProperty({ description: 'Final score', example: 85 })
  score: number;

  @ApiProperty({ description: 'Total questions', example: 10 })
  totalQuestions: number;

  @ApiProperty({ description: 'Correct answers', example: 8 })
  correctAnswers: number;

  @ApiProperty({ description: 'Time spent in milliseconds', example: 300000 })
  timeSpent: number;

  @ApiProperty({ description: 'XP earned', example: 150 })
  xpEarned: number;

  @ApiProperty({ description: 'Player rank', example: 1 })
  rank?: number;

  @ApiProperty({ description: 'Completion date', format: 'date-time' })
  completedAt: string;

  @ApiProperty({ description: 'Accuracy percentage', example: 80 })
  accuracy: number;

  @ApiProperty({ description: 'Time spent in seconds', example: 300 })
  timeSpentSeconds: number;

  @ApiProperty({ description: 'Time spent in minutes', example: 5 })
  timeSpentMinutes: number;

  @ApiProperty({ description: 'Average time per question', example: 30000 })
  averageTimePerQuestion: number;

  @ApiProperty({ description: 'Score percentage', example: 85 })
  scorePercentage: number;

  @ApiProperty({ description: 'Is perfect score', example: false })
  isPerfectScore: boolean;

  @ApiProperty({ description: 'Is good score', example: true })
  isGoodScore: boolean;

  @ApiProperty({ description: 'Is fast completion', example: true })
  isFastCompletion: boolean;

  @ApiProperty({ description: 'Performance rating', example: 'good' })
  performanceRating: 'excellent' | 'good' | 'average' | 'poor';

  @ApiProperty({ description: 'Rank display', example: '1st' })
  rankDisplay: string;

  @ApiProperty({ description: 'Bonus XP', example: 25 })
  bonusXp: number;

  @ApiProperty({ description: 'Total XP', example: 175 })
  totalXp: number;

  @ApiProperty({ description: 'Grade', example: 'B+' })
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';

  @ApiProperty({ description: 'Completion time', example: '5:00' })
  completionTime: string;
}

// Game Query DTO
export class GameQueryDto {
  @ApiPropertyOptional({ description: 'Game type filter', enum: GameType })
  @IsOptional()
  @IsEnum(GameType)
  type?: GameType;

  @ApiPropertyOptional({ description: 'Game mode filter', enum: GameMode })
  @IsOptional()
  @IsEnum(GameMode)
  mode?: GameMode;

  @ApiPropertyOptional({ description: 'Game status filter', enum: GameStatus })
  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

// Game Statistics DTO
export class GameStatsDto {
  @ApiProperty({ description: 'Total games played', example: 25 })
  totalGames: number;

  @ApiProperty({ description: 'Total score', example: 1250 })
  totalScore: number;

  @ApiProperty({ description: 'Average score', example: 50 })
  averageScore: number;

  @ApiProperty({ description: 'Total XP earned', example: 2500 })
  totalXp: number;

  @ApiProperty({ description: 'Average accuracy', example: 85 })
  averageAccuracy: number;

  @ApiProperty({ description: 'Best score', example: 95 })
  bestScore: number;

  @ApiProperty({ description: 'Worst score', example: 20 })
  worstScore: number;

  @ApiProperty({ description: 'Games won', example: 15 })
  gamesWon: number;

  @ApiProperty({ description: 'Win rate', example: 60 })
  winRate: number;
}
