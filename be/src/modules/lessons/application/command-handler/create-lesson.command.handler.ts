import { ConflictException, Inject, NotFoundException, HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SlugUtil } from '../../../../common/utils/slug.util';
import { extname } from 'path';
import { randomUUID } from 'crypto';

import { CreateLessonCommand } from '@/modules/lessons/application/command/create-lesson.command';
import { Lesson } from '@/modules/lessons/domain/entity/lesson.entity';
import { LessonType } from '@/modules/lessons/domain/enums/lesson-type.enum';
import {
  SECTION_REPOSITORY,
  ISectionRepository,
} from '@/modules/sections/domain/repository/section.repository';
import {
  LESSON_REPOSITORY,
  ILessonRepository,
} from '@/modules/lessons/domain/repository/lesson.repository';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '@/modules/courses/domain/repository/course.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { extractDuration } from '@/common/utils/media-duration.util';

const EDITABLE_STATUSES = [1, 4];

@CommandHandler(CreateLessonCommand)
export class CreateLessonHandler implements ICommandHandler<CreateLessonCommand> {
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,

    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,

    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,

    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: CreateLessonCommand) {
    const section = await this.sectionRepository.findById(command.sectionId);

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const course = await this.courseRepository.findById(section.courseId);
    if (course && !EDITABLE_STATUSES.includes(course.status)) {
      throw new AppException(ErrorCode.COURSE_NOT_EDITABLE, HttpStatus.FORBIDDEN);
    }

    const slug = SlugUtil.generate(command.title);

    const existingLesson = await this.lessonRepository.findBySlug(
      command.sectionId,
      slug,
    );

    if (existingLesson) {
      throw new ConflictException('Lesson slug already exists');
    }

    let videoSource = command.videoSource ?? null;
    let duration = command.duration ?? null;

    if (command.video) {
      const extension = extname(command.video.originalname).toLowerCase();
      videoSource = ['lessons', 'videos', `${randomUUID()}${extension}`].join('/');

      await this.storage.upload({
        key: videoSource,
        body: command.video.buffer,
        contentType: command.video.mimetype,
        contentLength: command.video.size,
      });

      if (command.type === LessonType.VIDEO || command.type === LessonType.AUDIO) {
        const extracted = await extractDuration(command.video.buffer, command.video.mimetype);
        if (extracted !== null) {
          duration = extracted;
        }
      }
    }

    try {
      const lesson = Lesson.create({
        sectionId: command.sectionId,
        title: command.title,
        slug,
        type: command.type,
        videoProvider: command.videoProvider,
        videoSource: videoSource,
        duration,
        content: command.content,
        position: command.position,
        isPreview: command.isPreview,
      });

      return await this.lessonRepository.create(lesson);
    } catch (error) {
      if (command.video && videoSource) {
        await this.storage.delete(videoSource);
      }
      throw error;
    }
  }
}
