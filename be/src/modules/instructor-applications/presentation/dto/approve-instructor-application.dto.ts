import { IsObject, IsOptional } from 'class-validator';

export class ApproveInstructorApplicationDto {
  @IsObject()
  @IsOptional()
  certificateTags?: Record<string, string[]>;
}
