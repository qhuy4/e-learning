import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { Enrollment } from '@/modules/enrollments/domain/entity/enrollment.entity';
import { EnrollmentStatus } from '@/modules/enrollments/domain/enum/enrollment-status.enum';

export class EnrollmentMapper {
  static toDomain(entity: EnrollmentOrmEntity): Enrollment {
    return Enrollment.restore({
      id: Number(entity.id),
      userId: Number(entity.userId),
      courseId: Number(entity.courseId),
      status: entity.status as EnrollmentStatus,
      progress: entity.progress,
      pricePaid: entity.pricePaid ? Number(entity.pricePaid) : null,
      currency: entity.currency,
      completedAt: entity.completedAt,
      lastAccessedAt: entity.lastAccessedAt,
      expiresAt: entity.expiresAt,
      enrolledAt: entity.enrolledAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      user: entity.user
        ? { id: entity.user.id, name: entity.user.name, email: entity.user.email }
        : undefined,
      course: entity.course
        ? { id: entity.course.id, title: entity.course.title, thumbnail: entity.course.thumbnail }
        : undefined,
    });
  }
}
