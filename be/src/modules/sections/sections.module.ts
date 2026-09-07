import { Module, forwardRef } from '@nestjs/common'; // 👈 Thêm forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { SectionOrmEntity } from '@/modules/sections/infrastructure/entity/section.orm-entity';
import { SectionRepository } from '@/modules/sections/infrastructure/repository/section.repository';

import { SECTION_REPOSITORY } from '@/modules/sections/domain/repository/section.repository';

import { CreateSectionHandler } from '@/modules/sections/application/command-handler/create-section.command.handler';
import { UpdateSectionHandler } from '@/modules/sections/application/command-handler/update-section.command.handler';
import { DeleteSectionHandler } from '@/modules/sections/application/command-handler/delete-section.command.handler';

import { SectionController } from '@/modules/sections/presentation/section.controller';

const CommandHandlers = [
  CreateSectionHandler,
  UpdateSectionHandler,
  DeleteSectionHandler,
];

// const QueryHandlers = [GetSectionByIdHandler, GetSectionsByCourseHandler];

import { CoursesModule } from '@/modules/courses/courses.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([SectionOrmEntity]),
    forwardRef(() => CoursesModule),
  ],
  controllers: [SectionController],
  providers: [
    SectionRepository,
    {
      provide: SECTION_REPOSITORY,
      useExisting: SectionRepository,
    },
    ...CommandHandlers,
  ],
  exports: [SECTION_REPOSITORY],
})
export class SectionsModule {}
