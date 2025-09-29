import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class AnswerQuizDto {
  @Transform(({ value, obj }) => value ?? obj.attempt_id ?? obj.attemptId)
  @IsString()
  attemptId!: string;

  @Transform(({ value, obj }) => value ?? obj.selected_option_id ?? obj.selectedOptionId)
  @IsString()
  selectedOptionId!: string;
}
