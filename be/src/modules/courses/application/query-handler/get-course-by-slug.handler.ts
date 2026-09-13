import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCourseBySlugQuery } from '../query/get-course-by-slug.query';
import { CourseRepository } from '../../infrastructure/repository/course.repository';
import { CourseDtoMapper } from '../../presentation/mappers/course-dto.mapper';
import { FILE_STORAGE,FileStorage } from '@/common/storage/domain/interface/file-storage.interface';

@QueryHandler(GetCourseBySlugQuery)
@Injectable()
export class GetCourseBySlugHandler implements IQueryHandler<GetCourseBySlugQuery> {
  constructor(
    private readonly courseRepository: CourseRepository,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(query: GetCourseBySlugQuery) {
    const courseEntity = await this.courseRepository.getCourseDetail(query.slug);
    if (!courseEntity) {
      throw new NotFoundException('Course not found');
    }

    return CourseDtoMapper.toDetailDto(courseEntity, this.storage);
  }
}
