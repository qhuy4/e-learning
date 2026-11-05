import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLessonCommentCommand } from '../command/create-lesson-comment.command';
import {
  ILessonCommentRepository,
  LESSON_COMMENT_REPOSITORY,
} from '../../domain/repository/lesson-comment.repository';
import { LessonComment } from '../../domain/entity/lesson-comment.entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(CreateLessonCommentCommand)
export class CreateLessonCommentHandler
  implements ICommandHandler<CreateLessonCommentCommand>
{
  private readonly logger = new Logger(CreateLessonCommentHandler.name);

  constructor(
    @Inject(LESSON_COMMENT_REPOSITORY)
    private readonly lessonCommentRepository: ILessonCommentRepository,
    @InjectRepository(LessonOrmEntity)
    private readonly lessonRepository: Repository<LessonOrmEntity>,
    @InjectRepository(EnrollmentOrmEntity)
    private readonly enrollmentRepository: Repository<EnrollmentOrmEntity>,
  ) {}

  async execute(command: CreateLessonCommentCommand): Promise<LessonComment> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: command.lessonId.toString() },
      relations: { section: { course: true } },
    });
    if (!lesson) {
      throw new AppException(ErrorCode.LESSON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.assertCanComment(
      command.userId,
      lesson,
    );

    // Trả lời bình luận → parent phải thuộc đúng bài học này.
    if (command.parentId !== null) {
      const parent = await this.lessonCommentRepository.findById(
        command.parentId,
      );
      // bigint pg trả string → Number() trước khi so sánh.
      if (!parent || Number(parent.lessonId) !== command.lessonId) {
        throw new AppException(
          ErrorCode.LESSON_COMMENT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const entity = new LessonComment(
      0,
      command.lessonId,
      command.userId,
      command.parentId,
      command.content,
    );

    return this.lessonCommentRepository.create(entity);
  }

  /**
   * Chỉ giảng viên của khóa, người đã ghi danh, hoặc bài preview được bình luận.
   */
  private async assertCanComment(
    userId: number,
    lesson: LessonOrmEntity,
  ): Promise<void> {
    const course = lesson.section?.course;
    const courseId = Number(lesson.section?.courseId);

    const isInstructor =
      course && Number(course.instructorId) === userId;
    if (isInstructor) return;

    // Bài xem thử → ai đăng nhập cũng bình luận được.
    if (lesson.isPreview) return;

    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        userId: userId.toString(),
        courseId: courseId.toString(),
        status: 1,
      },
    });
    if (!enrollment) {
      this.logger.warn(
        `User ${userId} commented lesson ${lesson.id} without enrollment in course ${courseId}`,
      );
      throw new AppException(
        ErrorCode.INVALID_PERMISSION,
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
