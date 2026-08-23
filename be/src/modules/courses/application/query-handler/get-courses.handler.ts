import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCoursesQuery } from '../query/get-courses.query';

import { CourseRepository } from '../../infrastructure/repository/course.repository';

import { CourseResponseDto } from '../../presentation/dto/course-response.dto';

@QueryHandler(GetCoursesQuery)
@Injectable()
export class GetCoursesHandler implements IQueryHandler<GetCoursesQuery> {
  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(query: GetCoursesQuery) {
    const [courses, total] = await this.courseRepository.findPublishedCourses({
      page: query.page,
      limit: query.limit,
      level: query.level,
      keyword: query.keyword,
    });

    return {
      data: courses.map((entity) => CourseResponseDto.fromEntity(entity)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
