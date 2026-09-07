import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import slugify from 'slugify';
import { extname } from 'path';
import { randomUUID } from 'crypto';

import { CreateLessonCommand } from '@/modules/lessons/application/command/create-lesson.command';
import { Lesson } from '@/modules/lessons/domain/entity/lesson.entity';
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

@CommandHandler(CreateLessonCommand)
export class CreateLessonHandler implements ICommandHandler<CreateLessonCommand> {
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,

    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,

    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(command: CreateLessonCommand) {
    const section = await this.sectionRepository.findById(command.sectionId);

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const slug = slugify(command.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const existingLesson = await this.lessonRepository.findBySlug(
      command.sectionId,
      slug,
    );

    if (existingLesson) {
      throw new ConflictException('Lesson slug already exists');
    }

    let videoSource = command.videoSource ?? null;

    if (command.video) {
      const extension = extname(command.video.originalname).toLowerCase();
      videoSource = ['lessons', 'videos', `${randomUUID()}${extension}`].join('/');

      await this.storage.upload({
        key: videoSource,
        body: command.video.buffer,
        contentType: command.video.mimetype,
        contentLength: command.video.size,
      });
    }

    try {
      const lesson = Lesson.create({
        sectionId: command.sectionId,
        title: command.title,
        slug,
        type: command.type,
        videoProvider: command.videoProvider,
        videoSource: videoSource,
        duration: command.duration,
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
