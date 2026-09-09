import { Enrollment } from '@/modules/enrollments/domain/entity/enrollment.entity';
import { AdminEnrollmentListResponseDto } from '@/modules/enrollments/presentation/dto/admin-enrollment-list-response.dto';
import { AdminEnrollmentDetailResponseDto } from '@/modules/enrollments/presentation/dto/admin-enrollment-detail-response.dto';

export class EnrollmentDtoMapper {
  static toListDto(enrollment: Enrollment): AdminEnrollmentListResponseDto {
    return {
      id: String(enrollment.id),
      userName: enrollment.user?.name ?? '',
      userEmail: enrollment.user?.email ?? '',
      courseTitle: enrollment.course?.title ?? '',
      progress: enrollment.progress,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      createdAt: enrollment.createdAt,
    };
  }

  static toDetailDto(enrollment: Enrollment): AdminEnrollmentDetailResponseDto {
    return {
      id: String(enrollment.id),
      userId: String(enrollment.userId),
      userName: enrollment.user?.name ?? '',
      userEmail: enrollment.user?.email ?? '',
      courseId: String(enrollment.courseId),
      courseTitle: enrollment.course?.title ?? '',
      courseThumbnail: enrollment.course?.thumbnail ?? null,
      progress: enrollment.progress,
      status: enrollment.status,
      pricePaid: enrollment.pricePaid,
      currency: enrollment.currency,
      completedAt: enrollment.completedAt,
      lastAccessedAt: enrollment.lastAccessedAt,
      expiresAt: enrollment.expiresAt,
      enrolledAt: enrollment.enrolledAt,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    };
  }
}
