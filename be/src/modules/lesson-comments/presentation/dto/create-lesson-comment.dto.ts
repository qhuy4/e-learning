import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLessonCommentDto {
  @IsInt()
  lessonId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  /** Trả lời bình luận khác — để null cho bình luận gốc */
  @IsOptional()
  @IsInt()
  parentId?: number | null;
}
