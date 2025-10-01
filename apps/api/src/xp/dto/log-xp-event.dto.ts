import { IsEnum, IsObject, IsOptional } from 'class-validator';

export enum XpEventRequestType {
  DAILY_LOGIN = 'daily_login',
  QUIZ_CORRECT = 'quiz_correct',
  POPULAR_NEWS = 'popular_news',
}

export class LogXpEventDto {
  @IsEnum(XpEventRequestType)
  event!: XpEventRequestType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
