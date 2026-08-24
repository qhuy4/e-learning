import { Inject, NotFoundException } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { extname } from 'path';

import { randomUUID } from 'crypto';

import {
  FILE_STORAGE,
  FileStorage,
} from '../../../../common/storage/domain/interface/file-storage.interface';

import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '../../domain/repository/course.repository';

import { CreateCourseThumbnailUploadCommand } from '../command/create-course-thumbnail-upload.command';

@CommandHandler(CreateCourseThumbnailUploadCommand)
export class CreateCourseThumbnailUploadHandler implements ICommandHandler<CreateCourseThumbnailUploadCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,

    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(command: CreateCourseThumbnailUploadCommand) {
    const course = await this.courseRepository.findById(command.courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const extension = extname(command.fileName).toLowerCase();

    const key = [
      'courses',
      command.courseId,
      'thumbnail',
      `${randomUUID()}${extension}`,
    ].join('/');

    const uploadUrl = await this.storage.createUploadUrl({
      key,
      contentType: command.contentType,
      expiresIn: 3600,
    });

    return {
      key,

      uploadUrl,
      expiresIn: 3600,
    };
  }
}
