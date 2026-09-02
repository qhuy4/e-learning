import { Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCourseBySlugQuery } from '../query/get-course-by-slug.query';
import { CourseRepository } from '../../infrastructure/repository/course.repository';
import { CourseDtoMapper } from '../../presentation/mappers/course-dto.mapper';

@QueryHandler(GetCourseBySlugQuery)
@Injectable()
export class GetCourseBySlugHandler implements IQueryHandler<GetCourseBySlugQuery> {
  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(query: GetCourseBySlugQuery) {
    const course = await this.courseRepository.findPublishedBySlug(query.slug);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return CourseDtoMapper.toDetailDto(course);
  }
}
