import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExamFormatSectionDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsNumber()
  position: number;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  @IsNumber()
  questionCount?: number;
}

export class CreateExamFormatDto {
  @IsNumber()
  examTypeId: number;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  effectiveFrom?: string;

  @IsOptional()
  @IsString()
  effectiveTo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExamFormatSectionDto)
  sections?: CreateExamFormatSectionDto[];
}
