import { ConflictException, HttpStatus, Inject } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloneCourseCommand } from '../command/clone-course.command';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '../../domain/repository/course.repository';
import {
  SECTION_REPOSITORY,
  ISectionRepository,
} from '@/modules/sections/domain/repository/section.repository';
import {
  LESSON_REPOSITORY,
  ILessonRepository,
} from '@/modules/lessons/domain/repository/lesson.repository';
import { Section } from '@/modules/sections/domain/entity/section.entity';
import { Lesson } from '@/modules/lessons/domain/entity/lesson.entity';
import { SlugUtil } from '@/common/utils/slug.util';
import { Course } from '@/modules/courses/domain/entity/course.entity';
import { CourseStatus } from '@/modules/courses/domain/enum/course-status.enum';

@CommandHandler(CloneCourseCommand)
export class CloneCourseHandler implements ICommandHandler<CloneCourseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute(command: CloneCourseCommand) {
    const originalCourse = await this.courseRepository.findById(
      command.courseId,
    );

    if (!originalCourse) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (!originalCourse.id) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const existingClone = await this.courseRepository.findUnpublishedClone(
      originalCourse.id,
    );

    if (existingClone) {
      throw new ConflictException(
        'Khóa học này đã có bản sao đang chờ xử lý. Vui lòng publish bản sao hiện tại trước khi tạo bản sao mới.',
      );
    }

    const currentVersion = originalCourse.version || 1;
    const nextVersion = currentVersion + 1;
    const clonedCourse = Course.create({
      title: originalCourse.title,
      slug: SlugUtil.generate(`${originalCourse.title}-v${nextVersion}`),
      description: originalCourse.description,
      thumbnail: originalCourse.thumbnail,
      level: originalCourse.level,
      price: originalCourse.price,
      status: CourseStatus.DRAFT,
      parentId: originalCourse.id,
      version: nextVersion,
      instructorId: originalCourse.instructorId,
    });

    const savedCourse = await this.courseRepository.create(clonedCourse);

    if (!savedCourse.id) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const sections = await this.sectionRepository.findByCourseId(
      originalCourse.id,
    );

    for (const originalSection of sections) {
      const clonedSection = Section.create({
        courseId: savedCourse.id,
        title: originalSection.title,
        slug: originalSection.slug,
        description: originalSection.description,
        position: originalSection.position,
        isActive: originalSection.isActive,
      });

      const savedSection = await this.sectionRepository.create(clonedSection);

      if (!savedSection.id) {
        throw new AppException(ErrorCode.SECTION_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (!originalSection.id) {
        throw new AppException(ErrorCode.SECTION_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      const lessons = await this.lessonRepository.findBySectionId(
        originalSection.id,
      );

      for (const originalLesson of lessons) {
        const clonedLesson = Lesson.create({
          sectionId: savedSection.id,
          title: originalLesson.title,
          slug: originalLesson.slug,
          type: originalLesson.type,
          videoProvider: originalLesson.videoProvider,
          videoSource: originalLesson.videoSource,
          thumbnail: originalLesson.thumbnail,
          duration: originalLesson.duration,
          content: originalLesson.content,
          position: originalLesson.position,
          status: originalLesson.status,
          isPreview: originalLesson.isPreview,
        });

        await this.lessonRepository.create(clonedLesson);
      }
    }

    return savedCourse;
  }
}
