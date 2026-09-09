import { Inject, NotFoundException, HttpStatus } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteLessonCommand } from '@/modules/lessons/application/command/delete-lesson.command';

import {
  LESSON_REPOSITORY,
  ILessonRepository,
} from '@/modules/lessons/domain/repository/lesson.repository';

import {
  SECTION_REPOSITORY,
  ISectionRepository,
} from '@/modules/sections/domain/repository/section.repository';

import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '@/modules/courses/domain/repository/course.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

const EDITABLE_STATUSES = [1, 4];

@CommandHandler(DeleteLessonCommand)
export class DeleteLessonHandler implements ICommandHandler<DeleteLessonCommand> {
  constructor(
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: DeleteLessonCommand) {
    const lesson = await this.lessonRepository.findById(command.id);

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const section = await this.sectionRepository.findById(lesson.sectionId);
    if (section) {
      const course = await this.courseRepository.findById(section.courseId);
      if (course && !EDITABLE_STATUSES.includes(course.status)) {
        throw new AppException(ErrorCode.COURSE_NOT_EDITABLE, HttpStatus.FORBIDDEN);
      }
    }

    await this.lessonRepository.delete(command.id);

    return {
      success: true,
    };
  }
}
