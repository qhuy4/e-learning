import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePayoutAccountDto {
  @IsOptional()
  @IsString()
  accountType?: string;

  @IsOptional()
  @IsString()
  accountHolderName?: string;

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

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
