import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { InstructorCertificateTag } from '@/modules/instructor-applications/domain/enums/instructor-certificate-tag.enum';

export class ListPublicInstructorsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 12;

  @IsString()
  @IsOptional()
  keyword?: string;

  @IsEnum(InstructorCertificateTag)
  @IsOptional()
  tag?: InstructorCertificateTag;
}
