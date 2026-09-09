import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetInstructorCoursesQuery } from '@/modules/courses/application/query/get-instructor-courses.query';
import { CourseRepository } from '@/modules/courses/infrastructure/repository/course.repository';
import { CourseResponseDto } from '@/modules/courses/presentation/dto/course-response.dto';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';

@QueryHandler(GetInstructorCoursesQuery)
@Injectable()
export class GetInstructorCoursesHandler
  implements IQueryHandler<GetInstructorCoursesQuery>
{
  constructor(
    private readonly courseRepository: CourseRepository,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(query: GetInstructorCoursesQuery) {
    const [courses, total] =
      await this.courseRepository.findCoursesByInstructorId(
        query.instructorId,
        {
          page: query.page,
          limit: query.limit,
          level: query.level,
          keyword: query.keyword,
          status: query.status,
        },
      );

    const data = await Promise.all(
      courses.map((entity) =>
        CourseResponseDto.fromEntity(entity, this.storage),
      ),
    );

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
