import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  FILE_STORAGE,
  FileStorage,
} from '../../../../common/storage/domain/interface/file-storage.interface';

import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '../../domain/repository/course.repository';

import { UpdateCourseThumbnailCommand } from '../command/update-course-thumbnail.command';

@CommandHandler(UpdateCourseThumbnailCommand)
export class UpdateCourseThumbnailHandler implements ICommandHandler<UpdateCourseThumbnailCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,

    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(command: UpdateCourseThumbnailCommand) {
    const course = await this.courseRepository.findById(command.courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const exists = await this.storage.exists(command.key);

    if (!exists) {
      throw new BadRequestException('Thumbnail file does not exist');
    }

    const oldThumbnail = course.thumbnail;

    course.update({ thumbnail: command.key });

    const updatedCourse = await this.courseRepository.update(course);

    if (oldThumbnail && oldThumbnail !== command.key) {
      await this.storage.delete(oldThumbnail);
    }

    return updatedCourse;
  }
}
