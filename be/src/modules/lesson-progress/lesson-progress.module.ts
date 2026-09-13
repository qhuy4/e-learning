import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonProgressOrmEntity } from './infrastructure/entity/lesson-progress.orm-entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { LessonProgressRepository } from './infrastructure/repository/lesson-progress.repository';
import { LESSON_PROGRESS_REPOSITORY } from './domain/repository/lesson-progress.repository';
import { UpdateLessonProgressHandler } from './application/command-handler/update-lesson-progress.handler';
import { GetLessonProgressHandler } from './application/query-handler/get-lesson-progress.handler';
import { GetCourseProgressHandler } from './application/query-handler/get-course-progress.handler';
import { LessonProgressController } from './presentation/lesson-progress.controller';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([LessonProgressOrmEntity, LessonOrmEntity, EnrollmentOrmEntity]),
  ],
  controllers: [LessonProgressController],
  providers: [
    UpdateLessonProgressHandler,
    GetLessonProgressHandler,
    GetCourseProgressHandler,
    {
      provide: LESSON_PROGRESS_REPOSITORY,
      useClass: LessonProgressRepository,
    },
  ],
})
export class LessonProgressModule {}
