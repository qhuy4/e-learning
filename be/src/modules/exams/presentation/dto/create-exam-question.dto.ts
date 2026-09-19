import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExamOptionDto {
  @IsString()
  content: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsNumber()
  position: number;
}

export class CreateExamQuestionDto {
  @IsOptional()
  @IsNumber()
  materialId?: number;

  @IsNumber()
  questionTypeId: number;

  @IsString()
  question: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsNumber()
  position: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExamOptionDto)
  options?: CreateExamOptionDto[];
}
