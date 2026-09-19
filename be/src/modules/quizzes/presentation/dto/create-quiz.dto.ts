import { IsString, IsOptional, IsBoolean, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuizQuestionType } from '../../domain/enums/quiz-question-type.enum';

export class CreateQuizOptionDto {
  @IsString()
  content: string;
  @IsBoolean()
  isCorrect: boolean;
  @IsInt()
  position: number;
}

export class CreateQuizQuestionDto {
  @IsString()
  question: string;
  @IsString()
  type: QuizQuestionType;
  @IsOptional()
  @IsString()
  audioUrl?: string;
  @IsOptional()
  @IsString()
  imageUrl?: string;
  @IsOptional()
  @IsString()
  explanation?: string;
  @IsInt()
  points: number;
  @IsInt()
  position: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizOptionDto)
  options: CreateQuizOptionDto[];
}

export class CreateQuizDto {
  @IsString()
  title: string;
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
