import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonNoteOrmEntity } from './infrastructure/entity/lesson-note.orm-entity';
import { LessonNoteRepository } from './infrastructure/repository/lesson-note.repository';
import { LESSON_NOTE_REPOSITORY } from './domain/repository/lesson-note.repository';
import { CreateLessonNoteHandler } from './application/command-handler/create-lesson-note.handler';
import { UpdateLessonNoteHandler } from './application/command-handler/update-lesson-note.handler';
import { DeleteLessonNoteHandler } from './application/command-handler/delete-lesson-note.handler';
import { GetLessonNotesHandler } from './application/query-handler/get-lesson-notes.handler';
import { LessonNoteController } from './presentation/lesson-note.controller';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([LessonNoteOrmEntity])],
  controllers: [LessonNoteController],
  providers: [
    CreateLessonNoteHandler,
    UpdateLessonNoteHandler,
    DeleteLessonNoteHandler,
    GetLessonNotesHandler,
    {
      provide: LESSON_NOTE_REPOSITORY,
      useClass: LessonNoteRepository,
    },
  ],
})
export class LessonNotesModule {}
