import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
      throw new NotFoundException('Course not found');
    }

    return AdminCourseDtoMapper.toDetailDto(course, this.storage, this.categoryCourseRepo, this.categoryRepo);
  }
}
