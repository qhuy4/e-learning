import { Inject, NotFoundException, HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SlugUtil } from '../../../../common/utils/slug.util';
import { extname } from 'path';
import { randomUUID } from 'crypto';

import { UpdateLessonCommand } from '@/modules/lessons/application/command/update-lesson.command';
import { LessonType } from '@/modules/lessons/domain/enums/lesson-type.enum';
import {
  LESSON_REPOSITORY,
  ILessonRepository,
} from '@/modules/lessons/domain/repository/lesson.repository';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';
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
import { extractDuration } from '@/common/utils/media-duration.util';

const EDITABLE_STATUSES = [1, 4];

@CommandHandler(UpdateLessonCommand)
export class UpdateLessonHandler implements ICommandHandler<UpdateLessonCommand> {
  constructor(
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,

    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,

    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,

    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: UpdateLessonCommand) {
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

    const slug = command.data.title
      ? SlugUtil.generate(command.data.title)
      : undefined;

    let videoSource = command.data.videoSource ?? lesson.videoSource;
    let oldVideoSource: string | null = null;
    let duration = command.data.duration;

    if (command.data.video) {
      const extension = extname(command.data.video.originalname).toLowerCase();
      videoSource = ['lessons', 'videos', `${randomUUID()}${extension}`].join('/');

      await this.storage.upload({
        key: videoSource,
        body: command.data.video.buffer,
        contentType: command.data.video.mimetype,
        contentLength: command.data.video.size,
      });

      if (lesson.videoSource) {
        oldVideoSource = lesson.videoSource;
      }

      const lessonType = command.data.type ?? lesson.type;
      if (lessonType === LessonType.VIDEO || lessonType === LessonType.AUDIO) {
        const extracted = await extractDuration(command.data.video.buffer, command.data.video.mimetype);
        if (extracted !== null) {
          duration = extracted;
        }
      }
    }

    try {
      lesson.update({
        ...command.data,
        videoSource,
        duration,
        slug,
      });

      const updatedLesson = await this.lessonRepository.update(lesson);

      if (oldVideoSource) {
        // Run delete asynchronously in background to not block
        this.storage.delete(oldVideoSource).catch(console.error);
      }

      return updatedLesson;
    } catch (error) {
      if (command.data.video && videoSource) {
        await this.storage.delete(videoSource).catch(console.error);
      }
      throw error;
    }
  }
}
