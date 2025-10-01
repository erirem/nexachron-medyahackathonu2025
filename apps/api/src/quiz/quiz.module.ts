import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { RateLimitMiddleware } from '../common/middleware/rate-limit.middleware';
import { XpModule } from '../xp/xp.module';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

@Module({
  imports: [XpModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes(
        { path: 'quiz/next', method: RequestMethod.GET },
        { path: 'quiz/answer', method: RequestMethod.POST },
      );
  }
}
