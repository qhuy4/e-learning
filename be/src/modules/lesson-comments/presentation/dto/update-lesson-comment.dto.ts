import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateLessonCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}
