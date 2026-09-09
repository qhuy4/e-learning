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

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsIn(Object.values(LessonType))
  type?: LessonType;

  @IsOptional()
  @IsString()
  videoProvider?: string | null;

  @IsOptional()
  @IsString()
  videoSource?: string | null;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === 'null' || value === 'undefined') {
      return null;
    }
    return Number(value);
  })
  @IsInt()
  @Min(0)
  duration?: number | null;

  @IsOptional()
  @IsString()
  content?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  @IsInt()
  status?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return undefined;
  })
  @IsBoolean()
  isPreview?: boolean;
}
