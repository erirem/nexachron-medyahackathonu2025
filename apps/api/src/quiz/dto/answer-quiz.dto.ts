import { IsString } from 'class-validator';

export class AnswerQuizDto {
  @IsString()
  attempt_id!: string;

  @IsString()
  selected_option_id!: string;
}
