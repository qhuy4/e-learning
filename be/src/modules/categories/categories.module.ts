import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { CategoryOrmEntity } from '@/modules/categories/infrastructure/entity/category.orm-entity';
import { CategoryCourseOrmEntity } from '@/modules/categories/infrastructure/entity/category-course.orm-entity';
import { CategoryRepository } from '@/modules/categories/infrastructure/repository/category.repository';
import { CATEGORY_REPOSITORY } from '@/modules/categories/domain/repository/category.repository';

import { GetAdminCategoriesHandler } from '@/modules/categories/application/query-handler/get-admin-categories.handler';
import { GetAdminCategoryByIdHandler } from '@/modules/categories/application/query-handler/get-admin-category-by-id.handler';
import { CreateCategoryHandler } from '@/modules/categories/application/command-handler/create-category.handler';
import { UpdateCategoryHandler } from '@/modules/categories/application/command-handler/update-category.handler';
import { DeleteCategoryHandler } from '@/modules/categories/application/command-handler/delete-category.handler';

import { AdminCategoriesController } from '@/modules/categories/presentation/admin-categories.controller';
import { CategoriesController } from '@/modules/categories/presentation/categories.controller';

const QueryHandlers = [GetAdminCategoriesHandler, GetAdminCategoryByIdHandler];
const CommandHandlers = [CreateCategoryHandler, UpdateCategoryHandler, DeleteCategoryHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([CategoryOrmEntity, CategoryCourseOrmEntity]),
  ],
  controllers: [AdminCategoriesController, CategoriesController],
  providers: [
    CategoryRepository,
    {
      provide: CATEGORY_REPOSITORY,
      useExisting: CategoryRepository,
    },
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
