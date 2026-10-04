import { IsString, IsOptional } from 'class-validator';

export class UpdateExamTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
