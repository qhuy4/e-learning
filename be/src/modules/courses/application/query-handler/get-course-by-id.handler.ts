import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCourseByIdQuery } from '../query/get-course-by-id.query';
import { CourseRepository } from '../../infrastructure/repository/course.repository';
import { AdminCourseDtoMapper } from '../../presentation/mappers/admin-course-dto.mapper';
import {
  FILE_STORAGE,
  FileStorage,
} from '../../../../common/storage/domain/interface/file-storage.interface';

@QueryHandler(GetCourseByIdQuery)
@Injectable()
export class GetCourseByIdHandler implements IQueryHandler<GetCourseByIdQuery> {
  constructor(
    private readonly courseRepository: CourseRepository,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(query: GetCourseByIdQuery) {
    const course = await this.courseRepository.findById(Number(query.id));

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return AdminCourseDtoMapper.toDetailDto(course, this.storage);
  }
}
