import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { CertificateItemDto } from './certificate-item.dto';

/**
 * Field text của multipart/form-data khi đăng ký làm giáo viên.
 * 3 file ảnh (identity_front, identity_back, selfie_with_id) được nhận
 * riêng qua FileFieldsInterceptor ở controller, không nằm trong DTO này.
 *
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

  @IsString()
  @IsNotEmpty({ message: 'Số CCCD/CMND không được để trống' })
  identityNumber: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CertificateItemDto)
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  certificates?: CertificateItemDto[];
}
