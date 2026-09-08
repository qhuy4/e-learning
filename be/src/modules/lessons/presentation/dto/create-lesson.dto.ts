import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { Transform } from 'class-transformer';
import { LessonType } from '@/modules/lessons/domain/enums/lesson-type.enum';

export class CreateLessonDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsIn(Object.values(LessonType))
  type?: LessonType;

  @IsOptional()
  @IsString()
  videoProvider?: string;

  @IsOptional()
  @IsString()
  videoSource?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  isPreview?: boolean;
}
