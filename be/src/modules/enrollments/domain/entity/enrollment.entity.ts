import { EnrollmentStatus } from '@/modules/enrollments/domain/enum/enrollment-status.enum';

export class Enrollment {
  private constructor(
    public readonly id: number | null,
    public readonly userId: number,
    public readonly courseId: number,
    public readonly status: EnrollmentStatus,
    public readonly progress: number,
    public readonly pricePaid: number | null,
    public readonly currency: string,
    public readonly completedAt: Date | null,
    public readonly lastAccessedAt: Date | null,
    public readonly expiresAt: Date | null,
    public readonly enrolledAt: Date | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public user?: any,
    public course?: any,
  ) {}

  static restore(params: {
    id: number;
    userId: number;
    courseId: number;
    status: EnrollmentStatus;
    progress: number;
    pricePaid: number | null;
    currency: string;
    completedAt: Date | null;
    lastAccessedAt: Date | null;
    expiresAt: Date | null;
    enrolledAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    user?: any;
    course?: any;
  }): Enrollment {
    return new Enrollment(
      params.id,
      params.userId,
      params.courseId,
      params.status,
      params.progress,
      params.pricePaid,
      params.currency,
      params.completedAt,
      params.lastAccessedAt,
      params.expiresAt,
      params.enrolledAt,
      params.createdAt,
      params.updatedAt,
      params.user,
      params.course,
    );
  }
}
