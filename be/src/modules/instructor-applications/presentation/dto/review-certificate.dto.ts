import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ReviewedCertificateOcrDto {
  @IsIn(['IELTS_TRF', 'TOEIC'])
  documentType: 'IELTS_TRF' | 'TOEIC';

  @IsOptional()
  @IsString()
  candidateName?: string;

  @IsOptional()
  @IsString()
  credentialNumber?: string;

  @IsOptional()
  @IsDateString()
  testDate?: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsOptional()
  @IsNumber()
  overall?: number;

  @IsOptional()
  @IsNumber()
  listening?: number;

  @IsOptional()
  @IsNumber()
  reading?: number;

  @IsOptional()
  @IsNumber()
  writing?: number;

  @IsOptional()
  @IsNumber()
  speaking?: number;
}

export class ReviewCertificateDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReviewedCertificateOcrDto)
  ocrData?: ReviewedCertificateOcrDto;
}
