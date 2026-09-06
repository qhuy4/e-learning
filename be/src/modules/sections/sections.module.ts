import { Module, forwardRef } from '@nestjs/common'; // 👈 Thêm forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { SectionOrmEntity } from './infrastructure/entity/section.orm-entity';
import { SectionRepository } from './infrastructure/repository/section.repository';
import { SECTION_REPOSITORY } from './domain/repository/section.repository';

import { CreateSectionHandler } from './application/command-handler/create-section.command.handler';
import { UpdateSectionHandler } from './application/command-handler/update-section.command.handler';
import { DeleteSectionHandler } from './application/command-handler/delete-section.command.handler';

import { SectionController } from './presentation/section.controller';
import { CoursesModule } from '../courses/courses.module';

const CommandHandlers = [
  CreateSectionHandler,
  UpdateSectionHandler,
  DeleteSectionHandler,
];

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
