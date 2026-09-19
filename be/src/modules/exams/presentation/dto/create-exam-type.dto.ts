import { IsString, IsOptional } from 'class-validator';

export class CreateExamTypeDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
