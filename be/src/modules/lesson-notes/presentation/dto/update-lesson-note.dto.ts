import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateLessonNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}
