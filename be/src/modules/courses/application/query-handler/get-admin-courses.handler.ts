import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetAdminCoursesQuery } from '../query/get-admin-courses.query';
import { CourseRepository } from '../../infrastructure/repository/course.repository';
import { CourseResponseDto } from '../../presentation/dto/course-response.dto';
import {
  FILE_STORAGE,
  FileStorage,
} from '../../../../common/storage/domain/interface/file-storage.interface';

@QueryHandler(GetAdminCoursesQuery)
@Injectable()
export class GetAdminCoursesHandler implements IQueryHandler<GetAdminCoursesQuery> {
  constructor(
    private readonly courseRepository: CourseRepository,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(query: GetAdminCoursesQuery) {
    const [courses, total] = await this.courseRepository.findAllCoursesForAdmin(
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
