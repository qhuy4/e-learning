import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SlugUtil } from '../../../../common/utils/slug.util';
import { extname } from 'path';
import { randomUUID } from 'crypto';

import { UpdateLessonCommand } from '../command/update-lesson.command';
import {
  LESSON_REPOSITORY,
  ILessonRepository,
} from '../../domain/repository/lesson.repository';
import {
  FILE_STORAGE,
  FileStorage,
} from '../../../../common/storage/domain/interface/file-storage.interface';

@CommandHandler(UpdateLessonCommand)
export class UpdateLessonHandler implements ICommandHandler<UpdateLessonCommand> {
  constructor(
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,

    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(command: UpdateLessonCommand) {
    const lesson = await this.lessonRepository.findById(command.id);

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const slug = command.data.title
      ? SlugUtil.generate(command.data.title)
      : undefined;

    let videoSource = command.data.videoSource ?? lesson.videoSource;
    let oldVideoSource: string | null = null;

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
    }

    try {
      lesson.update({
        ...command.data,
        videoSource,
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
