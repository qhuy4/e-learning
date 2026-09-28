import { IsString, IsOptional, IsBoolean, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuizQuestionDto } from './create-quiz.dto';

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  title?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
  @IsOptional()
  @IsInt()
  timeLimit?: number;
  @IsOptional()
  @IsInt()
  passingScore?: number;
  @IsOptional()
  @IsInt()
  maxAttempts?: number;
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;
  @IsOptional()
  @IsBoolean()
  shuffleOptions?: boolean;
  @IsOptional()
  @IsBoolean()
  showAnswerAfterSubmit?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  questions?: CreateQuizQuestionDto[];
}
