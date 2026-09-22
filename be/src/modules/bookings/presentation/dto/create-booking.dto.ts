import { IsNumber, IsString, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  @Min(1)
  studentId: number;

  @IsNumber()
  @Min(1)
  instructorId: number;

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
