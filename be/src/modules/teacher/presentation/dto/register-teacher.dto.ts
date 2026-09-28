import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { CertificateItemDto } from '@/modules/teacher/presentation/dto/certificate-item.dto';

/**
 * Field text của multipart/form-data khi đăng ký làm giáo viên.
 * Field `certificates` được client gửi dưới dạng CHUỖI JSON, ví dụ:
 *   certificates: '[{"certificateName":"TESOL","issuer":"TESOL Academy","issuedAt":"2022-05-01"}]'
 * kèm theo các file tương ứng ở field `certificate_files` (đúng thứ tự với mảng trên).
 */
export class RegisterTeacherDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  userId?: number;

  @IsString()
  @IsOptional()
  headline?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @IsObject()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  socialLinks?: Record<string, string>;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CertificateItemDto)
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  certificates?: CertificateItemDto[];
}
