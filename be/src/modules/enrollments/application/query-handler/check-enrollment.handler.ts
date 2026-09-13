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
    const { userId, courseSlug } = query.data;

    const enrolled = await this.enrollmentRepository.existsActiveByUserAndCourseSlug(
      userId,
      courseSlug,
    );

    return {
      enrolled,
      enrollment: enrolled ? { status: 1 } : null,
    };
  }
}
