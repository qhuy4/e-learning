import { IsOptional, IsString, IsInt, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCatalogCoursesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 12;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  levels?: string;

  @IsOptional()
  @IsIn(['all', 'free', 'paid'])
  price?: 'all' | 'free' | 'paid';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @IsIn(['popular', 'newest', 'price-asc', 'price-desc'])
  sort?: 'popular' | 'newest' | 'price-asc' | 'price-desc';
}
