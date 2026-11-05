import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { InstructorApplicationStatus } from '@/modules/instructor-applications/domain/enums/instructor-application-status.enum';

export class ListInstructorApplicationsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 10;

  @IsEnum(InstructorApplicationStatus)
  @IsOptional()
  status?: InstructorApplicationStatus;

  @IsString()
  @IsOptional()
  search?: string;
}
