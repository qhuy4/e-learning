import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAdminCourseByIdQuery } from '@/modules/courses/application/query/get-admin-course-by-id.query';
import { AdminCourseRepository } from '@/modules/courses/infrastructure/repository/admin-course.repository';
import { AdminCourseDtoMapper } from '@/modules/courses/presentation/mappers/admin-course-dto.mapper';
import { CourseMapper } from '@/modules/courses/infrastructure/mapper/course.mapper';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryOrmEntity } from '@/modules/categories/infrastructure/entity/category.orm-entity';
import { CategoryCourseOrmEntity } from '@/modules/categories/infrastructure/entity/category-course.orm-entity';

@QueryHandler(GetAdminCourseByIdQuery)
@Injectable()
export class GetAdminCourseByIdHandler implements IQueryHandler<GetAdminCourseByIdQuery> {
  constructor(
    private readonly adminCourseRepository: AdminCourseRepository,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
    @InjectRepository(CategoryOrmEntity)
    private readonly categoryRepo: Repository<CategoryOrmEntity>,
    @InjectRepository(CategoryCourseOrmEntity)
    private readonly categoryCourseRepo: Repository<CategoryCourseOrmEntity>,
  ) {}

  async execute(query: GetAdminCourseByIdQuery) {
    const entity = await this.adminCourseRepository.findById(query.data.id);
    if (!entity) {
      throw new NotFoundException(`Course with ID ${query.data.id} not found`);
    }
    const course = CourseMapper.toDomain(entity);
    return AdminCourseDtoMapper.toDetailDto(course, this.storage, this.categoryCourseRepo, this.categoryRepo);
  }
}
