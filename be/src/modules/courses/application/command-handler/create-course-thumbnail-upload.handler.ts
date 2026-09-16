import { HttpStatus, Inject } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { extname } from 'path';

import { randomUUID } from 'crypto';

import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';

import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '@/modules/courses/domain/repository/course.repository';

import { CreateCourseThumbnailUploadCommand } from '@/modules/courses/application/command/create-course-thumbnail-upload.command';

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
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
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
