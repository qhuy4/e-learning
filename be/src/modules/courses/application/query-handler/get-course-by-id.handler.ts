import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCourseByIdQuery } from '@/modules/courses/application/query/get-course-by-id.query';
import { CourseRepository } from '@/modules/courses/infrastructure/repository/course.repository';
import { AdminCourseDtoMapper } from '@/modules/courses/presentation/mappers/admin-course-dto.mapper';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryOrmEntity } from '@/modules/categories/infrastructure/entity/category.orm-entity';
import { CategoryCourseOrmEntity } from '@/modules/categories/infrastructure/entity/category-course.orm-entity';

@QueryHandler(GetCourseByIdQuery)
@Injectable()
export class GetCourseByIdHandler implements IQueryHandler<GetCourseByIdQuery> {
  constructor(
    private readonly courseRepository: CourseRepository,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
    @InjectRepository(CategoryOrmEntity)
    private readonly categoryRepo: Repository<CategoryOrmEntity>,
    @InjectRepository(CategoryCourseOrmEntity)
    private readonly categoryCourseRepo: Repository<CategoryCourseOrmEntity>,
  ) {}

  async execute(query: GetCourseByIdQuery) {
    const course = await this.courseRepository.findById(Number(query.id));

    if (!course) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return AdminCourseDtoMapper.toDetailDto(course, this.storage, this.categoryCourseRepo, this.categoryRepo);
  }
}
