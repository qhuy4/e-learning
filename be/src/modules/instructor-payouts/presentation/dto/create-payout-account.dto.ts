import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePayoutAccountDto {
  @IsNumber()
  instructorProfileId: number;

  @IsString()
  accountType: string;

  @IsString()
  accountHolderName: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankBranch?: string;

  @IsOptional()
  @IsString()
  routingCode?: string;

  @IsOptional()
  @IsString()
  paypalEmail?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
