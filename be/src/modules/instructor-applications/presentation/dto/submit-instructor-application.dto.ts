import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
export class SubmitCertificateDto {
  @IsString()
  @IsOptional()
  certificateName?: string;

  @IsString()
  @IsOptional()
  issuer?: string;

  @IsString()
  @IsOptional()
  issuedAt?: string;

  @IsString()
  @IsOptional()
  expiresAt?: string;
}
export class SubmitInstructorApplicationDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  headline?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, string>;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubmitCertificateDto)
  certificates?: SubmitCertificateDto[];
}
