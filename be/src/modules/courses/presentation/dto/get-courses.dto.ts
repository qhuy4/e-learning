/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { Type } from 'class-transformer';

export class GetCoursesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 12;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3)
  level?: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}
