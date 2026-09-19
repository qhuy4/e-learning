import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ExamMaterialType } from '../../domain/enums/exam-material-type.enum';

export class UpdateExamMaterialDto {
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
