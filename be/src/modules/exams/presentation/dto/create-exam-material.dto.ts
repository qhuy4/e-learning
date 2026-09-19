import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ExamMaterialType } from '../../domain/enums/exam-material-type.enum';

export class CreateExamMaterialDto {
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

  @IsNumber()
  position: number;
}
