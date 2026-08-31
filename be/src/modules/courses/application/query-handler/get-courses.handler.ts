import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCoursesQuery } from '../query/get-courses.query';
import { CourseRepository } from '../../infrastructure/repository/course.repository';
import { CourseResponseDto } from '../../presentation/dto/course-response.dto';
import {
  FILE_STORAGE,
  FileStorage,
} from '../../../../common/storage/domain/interface/file-storage.interface';

@QueryHandler(GetCoursesQuery)
@Injectable()
export class GetCoursesHandler implements IQueryHandler<GetCoursesQuery> {
  constructor(
    private readonly courseRepository: CourseRepository,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(query: GetCoursesQuery) {
    const [courses, total] = await this.courseRepository.findAllCourses({
      page: query.page,
      limit: query.limit,
      level: query.level,
      keyword: query.keyword,
      status: query.status,
    });

    const data = await Promise.all(
      courses.map((entity) => CourseResponseDto.fromEntity(entity, this.storage)),
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
