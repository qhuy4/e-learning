import {
  IsOptional,
  IsNumber,
  IsString,
} from 'class-validator';

export class UpdateExamQuestionDto {
  @IsOptional()
  @IsNumber()
  materialId?: number;

  @IsOptional()
  @IsNumber()
  questionTypeId?: number;

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsOptional()
  @IsNumber()
  position?: number;
}
