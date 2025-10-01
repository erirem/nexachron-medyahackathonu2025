import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class AnswerQuizDto {
  @Transform(({ value, obj }) => {
    const candidate = value ?? obj?.attempt_id ?? obj?.attemptId;
    return typeof candidate === 'string' ? candidate : undefined;
  })
  @IsString()
  attemptId!: string;

  @Transform(({ value, obj }) => {
    const candidate = value ?? obj?.selected_option_id ?? obj?.selectedOptionId;
    return typeof candidate === 'string' ? candidate : undefined;
  })
  @IsString()
  selectedOptionId!: string;
}
