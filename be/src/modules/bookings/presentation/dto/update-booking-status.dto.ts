import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBookingStatusDto {
  @Type(() => Number)
  @IsNumber()
  status: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
