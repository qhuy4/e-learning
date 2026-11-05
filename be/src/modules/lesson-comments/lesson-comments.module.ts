import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonCommentOrmEntity } from './infrastructure/entity/lesson-comment.orm-entity';
import { LessonCommentRepository } from './infrastructure/repository/lesson-comment.repository';
import { LESSON_COMMENT_REPOSITORY } from './domain/repository/lesson-comment.repository';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { CreateLessonCommentHandler } from './application/command-handler/create-lesson-comment.handler';
import { UpdateLessonCommentHandler } from './application/command-handler/update-lesson-comment.handler';
import { DeleteLessonCommentHandler } from './application/command-handler/delete-lesson-comment.handler';
import { GetLessonCommentsHandler } from './application/query-handler/get-lesson-comments.handler';
import { GetInstructorLessonCommentsHandler } from './application/query-handler/get-instructor-lesson-comments.handler';
import { GetLessonCommentThreadHandler } from './application/query-handler/get-lesson-comment-thread.handler';
import { StudentLessonCommentsController } from './presentation/student-lesson-comments.controller';
import { InstructorLessonCommentsController } from './presentation/instructor-lesson-comments.controller';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      LessonCommentOrmEntity,
      LessonOrmEntity,
      EnrollmentOrmEntity,
      CourseOrmEntity,
    ]),
  ],
  controllers: [
    StudentLessonCommentsController,
    InstructorLessonCommentsController,
  ],
  providers: [
    CreateLessonCommentHandler,
    UpdateLessonCommentHandler,
    DeleteLessonCommentHandler,
    GetLessonCommentsHandler,
    GetInstructorLessonCommentsHandler,
    GetLessonCommentThreadHandler,
    {
      provide: LESSON_COMMENT_REPOSITORY,
      useClass: LessonCommentRepository,
    },
  ],
})
export class LessonCommentsModule {}
