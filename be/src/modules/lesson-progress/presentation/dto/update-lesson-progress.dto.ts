import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class UpdateLessonProgressDto {
  @IsInt()
  courseId: number;

  @IsInt()
  lessonId: number;

  @IsInt()
  @Min(0)
  watchSeconds: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent: number;
}
