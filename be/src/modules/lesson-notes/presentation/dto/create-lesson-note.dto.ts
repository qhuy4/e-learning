import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateLessonNoteDto {
  @IsInt()
  lessonId: number;

  @IsInt()
  @Min(0)
  noteTimeSeconds: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}
