import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { GetMyEnrollmentsQuery } from '@/modules/enrollments/application/query/get-my-enrollments.query';
import {
  ENROLLMENT_REPOSITORY,
  IEnrollmentRepository,
} from '@/modules/enrollments/domain/repository/enrollment.repository';

@QueryHandler(GetMyEnrollmentsQuery)
export class GetMyEnrollmentsHandler
  implements IQueryHandler<GetMyEnrollmentsQuery>
{
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async execute(query: GetMyEnrollmentsQuery) {
    const { userId, page, limit } = query.data;

    const { data, total } = await this.enrollmentRepository.findByUser(userId, {
      page,
      limit,
    });

    return {
      data: data.map((e) => ({
        id: e.id,
        courseId: e.courseId,
        courseSlug: e.course?.slug ?? '',
        courseTitle: e.course?.title ?? '',
        courseThumbnail: e.course?.thumbnail ?? null,
        status: e.status,
        progress: e.progress,
        pricePaid: e.pricePaid,
        enrolledAt: e.enrolledAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
