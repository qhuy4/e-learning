import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ExamMaterialType } from '../../domain/enums/exam-material-type.enum';

export class CreateExamGroupMaterialDto {
  @IsEnum(ExamMaterialType)
  type: ExamMaterialType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  transcript?: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}

export class UpdateExamGroupMaterialDto {
  @IsOptional()
  @IsEnum(ExamMaterialType)
  type?: ExamMaterialType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  transcript?: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}
