import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
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
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return CourseDtoMapper.toDetailDto(courseEntity, this.storage);
  }
}
