import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Student-facing DTO: the authenticated user is always the student. */
export class CreateBookingCheckoutDto {
  @IsString()
  @IsNotEmpty()
  bookingDate: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
