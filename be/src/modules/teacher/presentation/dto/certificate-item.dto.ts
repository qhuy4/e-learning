import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CertificateItemDto {
  @IsString()
  @IsNotEmpty()
  certificateName: string;

  @IsString()
  @IsOptional()
  issuer?: string;

  @IsDateString()
  @IsOptional()
  issuedAt?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
