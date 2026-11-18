import { CourseStatus } from '@/modules/courses/domain/enum/course-status.enum';

export class UpdateCourseCommand {
  constructor(
    public readonly id: number,
    public readonly data: {
      title?: string;
      description?: string | null;
      thumbnail?: string | null;
      thumbnailFile?: Express.Multer.File;
      level?: number;
      price?: number;
      status?: CourseStatus;
      parentId?: number | null;
      categories?: string[];
    },
  ) {}
}
