import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/supabase-auth.guard';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import type { AnswerQuizDto } from './dto/answer-quiz.dto';
import type { GetNextQuizQueryDto } from './dto/get-next-quiz.dto';
import { QuizService } from './quiz.service';

const validationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
});

@Controller('quiz')
@UseGuards(SupabaseAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('next')
  @UsePipes(validationPipe)
  async getNextQuiz(
    @Req() request: AuthenticatedRequest,
    @Query() query: GetNextQuizQueryDto,
  ) {
    const userId = this.ensureUser(request);
    return this.quizService.getNextQuiz(userId, query);
  }

  @Post('answer')
  @UsePipes(validationPipe)
  async answerQuiz(
    @Req() request: AuthenticatedRequest,
    @Body() body: AnswerQuizDto,
  ) {
    const userId = this.ensureUser(request);
    return this.quizService.answerQuiz(userId, body);
  }

  private ensureUser(request: AuthenticatedRequest): string {
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Authenticated user is required for quiz endpoints.',
      );
    }
    return userId;
  }
}
