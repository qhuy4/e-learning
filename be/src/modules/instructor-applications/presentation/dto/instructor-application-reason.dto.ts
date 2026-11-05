import { IsNotEmpty, IsString } from 'class-validator';

export class InstructorApplicationReasonDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
