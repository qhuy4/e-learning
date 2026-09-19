import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class UpdateExamDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;
}
