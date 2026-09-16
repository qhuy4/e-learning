import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '@/modules/courses/domain/repository/course.repository';
import { UpdateCourseThumbnailCommand } from '@/modules/courses/application/command/update-course-thumbnail.command';

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
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const exists = await this.storage.exists(command.key);

    if (!exists) {
      throw new AppException(ErrorCode.COURSE_THUMBNAIL_NOT_FOUND, HttpStatus.BAD_REQUEST);
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
