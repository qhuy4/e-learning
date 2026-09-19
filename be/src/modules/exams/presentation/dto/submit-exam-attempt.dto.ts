import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitExamAnswerDto {
  @IsNumber()
  questionId: number;

  @IsOptional()
  @IsNumber()
  selectedOptionId?: number;

  @IsOptional()
  @IsString()
  answerText?: string;
}

export class SubmitExamAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitExamAnswerDto)
  answers: SubmitExamAnswerDto[];
}
