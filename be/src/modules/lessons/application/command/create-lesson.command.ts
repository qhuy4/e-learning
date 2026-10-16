import { LessonType } from '@/modules/lessons/domain/enums/lesson-type.enum';

export class CreateLessonCommand {
  constructor(
    public readonly sectionId: number,
    public readonly title: string,
    public readonly type?: LessonType,
    public readonly videoProvider?: string,
    public readonly videoSource?: string,
    public readonly duration?: number,
    public readonly content?: string,
    public readonly position?: number,
    public readonly isPreview?: boolean,
    public readonly video?: Express.Multer.File,
    public readonly thumbnail?: Express.Multer.File,
  ) {}
}
