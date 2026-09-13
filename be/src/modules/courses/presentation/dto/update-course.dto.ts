import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  thumbnail?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : Number(value),
  )
  @IsInt()
  @Min(1)
  level?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : Number(value),
  )
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : Number(value),
  )
  @IsInt()
  parentId?: number | null;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : Number(value),
  )
  @IsInt()
  @Min(1)
  status?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return value ? [value] : [];
      }
    }
    return [];
  })
  @IsArray()
  @Type(() => String)
  categories?: string[];
}
