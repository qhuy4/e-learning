import { IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
class QuizAnswerDto {
  @IsString()
  questionId: string;
  @IsOptional()
  @IsString()
  selectedOptionId?: string;
  @IsOptional()
  @IsString()
  answerText?: string;
}
export class SubmitQuizDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}
