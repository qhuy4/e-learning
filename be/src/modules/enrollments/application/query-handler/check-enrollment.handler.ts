import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { CheckEnrollmentQuery } from '@/modules/enrollments/application/query/check-enrollment.query';
import {
  ENROLLMENT_REPOSITORY,
  IEnrollmentRepository,
} from '@/modules/enrollments/domain/repository/enrollment.repository';

@QueryHandler(CheckEnrollmentQuery)
export class CheckEnrollmentHandler
  implements IQueryHandler<CheckEnrollmentQuery>
{
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async execute(query: CheckEnrollmentQuery) {
    const { userId, courseId } = query.data;

    const enrollment = await this.enrollmentRepository.findByUserAndCourse(
      userId,
      courseId,
    );

    return {
      enrolled: !!enrollment,
      enrollment: enrollment
        ? {
            id: enrollment.id,
            status: enrollment.status,
            progress: enrollment.progress,
            enrolledAt: enrollment.enrolledAt,
          }
        : null,
    };
  }
}
