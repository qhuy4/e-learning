import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { GetMyEnrollmentsQuery } from '@/modules/enrollments/application/query/get-my-enrollments.query';
import {
  ENROLLMENT_REPOSITORY,
  IEnrollmentRepository,
} from '@/modules/enrollments/domain/repository/enrollment.repository';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';

const THUMBNAIL_EXPIRES_IN = 3600;

async function resolveSignedUrl(
  key: string | null,
  storage: FileStorage,
): Promise<string | null> {
  if (!key) return null;
  if (key.startsWith('http')) return key;
  try {
    return await storage.createDownloadUrl({ key, expiresIn: THUMBNAIL_EXPIRES_IN });
  } catch {
    return null;
  }
}

@QueryHandler(GetMyEnrollmentsQuery)
export class GetMyEnrollmentsHandler
  implements IQueryHandler<GetMyEnrollmentsQuery>
{
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(query: GetMyEnrollmentsQuery) {
    const { userId, page, limit, keyword, status, sortBy, sortOrder } = query.data;

    const { data, total } = await this.enrollmentRepository.findByUser(userId, {
      page,
      limit,
      keyword,
      status,
      sortBy,
      sortOrder,
    });

    const enrollments = await Promise.all(
      data.map(async (e) => ({
        id: e.id,
        courseId: e.courseId,
        courseSlug: e.course?.slug ?? '',
        courseTitle: e.course?.title ?? '',
        courseThumbnail: await resolveSignedUrl(e.course?.thumbnail ?? null, this.storage),
        instructorName: e.course?.instructorName ?? null,
        status: e.status,
        progress: e.progress,
        pricePaid: e.pricePaid,
        enrolledAt: e.enrolledAt,
      })),
    );

    return {
      data: enrollments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
