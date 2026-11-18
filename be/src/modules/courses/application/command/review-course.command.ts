import { CourseStatus } from '@/modules/courses/domain/enum/course-status.enum';

export class ReviewCourseCommand {
  constructor(
    public readonly data: {
      id: string;
      status: CourseStatus;
      rejectReason?: string;
    },
  ) {}
}
