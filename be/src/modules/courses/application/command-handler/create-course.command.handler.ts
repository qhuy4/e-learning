import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import slugify from 'slugify';
import { extname } from 'path';
import { randomUUID } from 'crypto';

import { CreateCourseCommand } from '@/modules/courses/application/command/create-course.command';
import { Course } from '@/modules/courses/domain/entity/course.entity';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '@/modules/courses/domain/repository/course.repository';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';

import { Inject, ConflictException } from '@nestjs/common';

@CommandHandler(CreateCourseCommand)
export class CreateCourseHandler implements ICommandHandler<CreateCourseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,

    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(command: CreateCourseCommand) {
    const slug = slugify(command.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const existingCourse = await this.courseRepository.findBySlug(slug);

    if (existingCourse) {
      throw new ConflictException('Course slug already exists');
    }

    let key: string | null = null;

    if (command.thumbnail) {
      const extension = extname(command.thumbnail.originalname).toLowerCase();
      key = ['courses', 'thumbnails', `${randomUUID()}${extension}`].join('/');

      await this.storage.upload({
        key,
        body: command.thumbnail.buffer,
        contentType: command.thumbnail.mimetype,
        contentLength: command.thumbnail.size,
      });
    }

    try {
      const course = Course.create({
        instructorId: command.instructorId,
        title: command.title,
        slug,
        description: command.description,
        thumbnail: key,
        level: command.level,
        price: command.price,
        parentId: command.parentId,
      });

      const createdCourse = await this.courseRepository.create(course);

      return {
        id: createdCourse.id,
        slug: createdCourse.slug,
        title: createdCourse.title,
      };
    } catch (error) {
      if (key) {
        await this.storage.delete(key);
      }
      throw error;
    }
  }
}
