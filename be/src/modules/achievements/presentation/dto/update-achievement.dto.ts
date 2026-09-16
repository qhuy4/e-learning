import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';

export class UpdateAchievementDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  criteria?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  threshold?: number;

  @IsOptional()
  reward?: unknown;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
