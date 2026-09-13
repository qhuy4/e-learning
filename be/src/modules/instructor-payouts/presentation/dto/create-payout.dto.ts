import { IsNumber, IsString, IsDateString } from 'class-validator';

export class CreatePayoutDto {
  @IsNumber()
  instructorId: number;

  @IsNumber()
  payoutAccountId: number;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;
}
