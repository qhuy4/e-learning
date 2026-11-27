import {
  IsArray,
  IsInt,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  // @IsOptional()
  // @IsString()
  // @MaxLength(255)
  // thumbnail?: string;

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
  parentId?: number;

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

  @IsOptional()
  @IsIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  cefrLevelStart?: string;

  @IsOptional()
  @IsIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  cefrLevelEnd?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value ? value.split(',').map((item) => item.trim()) : [];
    }
  })
  @IsArray()
  @IsString({ each: true })
  @IsIn(
    [
      'grammar',
      'vocabulary',
      'speaking',
      'listening',
      'writing',
      'pronunciation',
      'reading',
    ],
    { each: true },
  )
  skillCodes?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map((v: unknown) => typeof v === 'string' ? v.trim() : v).filter((v: unknown) => v !== '');
    if (typeof value !== 'string') return value;
    try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed.map((v: unknown) => typeof v === 'string' ? v.trim() : v).filter((v: unknown) => v !== '') : parsed; } catch { return value; }
  })
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];
}
