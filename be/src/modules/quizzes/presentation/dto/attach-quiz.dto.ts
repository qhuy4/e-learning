import { IsString } from 'class-validator';
export class AttachQuizDto {
  @IsString()
  lessonId: string;
}
