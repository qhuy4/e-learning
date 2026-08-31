import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import slugify from 'slugify';
import { extname } from 'path';
import { randomUUID } from 'crypto';

import { UpdateCourseCommand } from '../command/update-course.command';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '../../domain/repository/course.repository';
import {
  FILE_STORAGE,
  FileStorage,
} from '../../../../common/storage/domain/interface/file-storage.interface';
import { AdminCourseDtoMapper } from '../../presentation/mappers/admin-course-dto.mapper';

@CommandHandler(UpdateCourseCommand)
export class UpdateCourseHandler implements ICommandHandler<UpdateCourseCommand> {
  private readonly logger = new Logger(UpdateCourseHandler.name);

  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,

    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(command: UpdateCourseCommand) {
    const course = await this.courseRepository.findById(command.id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const slug =
      command.data.title && command.data.title !== course.title
        ? slugify(command.data.title, { lower: true, strict: true, trim: true })
        : undefined;

    let thumbnail = course.thumbnail;
    let oldThumbnail: string | null = null;

    if (command.data.thumbnailFile) {
      const extension = extname(
        command.data.thumbnailFile.originalname,
      ).toLowerCase();
      thumbnail = ['courses', 'thumbnails', `${randomUUID()}${extension}`].join(
        '/',
      );

      await this.storage.upload({
        key: thumbnail,
        body: command.data.thumbnailFile.buffer,
        contentType: command.data.thumbnailFile.mimetype,
        contentLength: command.data.thumbnailFile.size,
      });

      if (course.thumbnail && !course.thumbnail.startsWith('http')) {
        oldThumbnail = course.thumbnail;
      }
    }
    try {
      course.update({
        title: command.data.title,
        description: command.data.description,
        thumbnail,
        level: command.data.level,
        price: command.data.price,
        status: command.data.status,
        parentId: command.data.parentId,
        slug,
      });

      this.logger.debug(
        `Saving course id=${course.id}, slug=${course.slug}, status=${course.status}`,
      );
      const updatedCourse = await this.courseRepository.update(course);

      if (oldThumbnail) {
        this.storage
          .delete(oldThumbnail)
          .catch((err) =>
            this.logger.warn(`Failed to delete old thumbnail: ${err.message}`),
          );
      }

      return AdminCourseDtoMapper.toDetailDto(updatedCourse, this.storage);
    } catch (error) {
      this.logger.error(
        `Failed to update course id=${command.id}: ${error.message}`,
        error.stack,
      );

      if (
        command.data.thumbnailFile &&
        thumbnail &&
        thumbnail !== course.thumbnail
      ) {
        await this.storage.delete(thumbnail).catch(console.error);
      }
      throw error;
    }
  }
}
