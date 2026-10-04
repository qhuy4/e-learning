import { IsString, IsOptional } from 'class-validator';

export class CreateExamTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
