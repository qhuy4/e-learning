import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AchievementCriteria } from '@/modules/achievements/domain/enum/achievement-criteria.enum';

export class CreateAchievementDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsEnum(AchievementCriteria)
  @IsNotEmpty()
  criteria: AchievementCriteria;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  threshold: number;

  @IsOptional()
  reward?: unknown;
}
