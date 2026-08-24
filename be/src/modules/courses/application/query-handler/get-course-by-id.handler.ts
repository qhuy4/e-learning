import { Injectable, NotFoundException } from '@nestjs/common';

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCourseByIdQuery } from '../query/get-course-by-id.query';

import { CourseRepository } from '../../infrastructure/repository/course.repository';

import { CourseResponseDto } from '../../presentation/dto/course-response.dto';

@QueryHandler(GetCourseByIdQuery)
@Injectable()
export class GetCourseByIdHandler implements IQueryHandler<GetCourseByIdQuery> {
  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(query: GetCourseByIdQuery) {
    const course = await this.courseRepository.findCourseOrmEntityPublishedById(Number(query.id));

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return CourseResponseDto.fromEntity(course);
  }
}
