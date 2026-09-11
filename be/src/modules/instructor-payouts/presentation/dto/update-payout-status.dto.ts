import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdatePayoutStatusDto {
  @IsNumber()
  status: number;

  @IsOptional()
  @IsString()
  transactionRef?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
