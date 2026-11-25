import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SlugUtil } from '../../../../common/utils/slug.util';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

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
import { CategoryOrmEntity } from '@/modules/categories/infrastructure/entity/category.orm-entity';
import { CategoryCourseOrmEntity } from '@/modules/categories/infrastructure/entity/category-course.orm-entity';

import { BadRequestException, Inject, ConflictException } from '@nestjs/common';
import { cefrIndex } from '@/modules/student-assessment/domain/cefr';

@CommandHandler(CreateCourseCommand)
export class CreateCourseHandler implements ICommandHandler<CreateCourseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,

    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,

    @InjectRepository(CategoryOrmEntity)
    private readonly categoryRepo: Repository<CategoryOrmEntity>,

    @InjectRepository(CategoryCourseOrmEntity)
    private readonly categoryCourseRepo: Repository<CategoryCourseOrmEntity>,
  ) {}

  async execute(command: CreateCourseCommand) {
    if (
      command.cefrLevelStart &&
      command.cefrLevelEnd &&
      cefrIndex(command.cefrLevelStart) > cefrIndex(command.cefrLevelEnd)
    ) {
      throw new BadRequestException(
        'CEFR đầu vào không được cao hơn CEFR đầu ra.',
      );
    }
    const slug = SlugUtil.generate(command.title);

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
        cefrLevelStart: command.cefrLevelStart,
        cefrLevelEnd: command.cefrLevelEnd,
        skillCodes: command.skillCodes,
        price: command.price,
        parentId: command.parentId,
        version: 1,
      });

      const createdCourse = await this.courseRepository.create(course);

      if (command.categories && command.categories.length > 0) {
        const categories = await this.categoryRepo.find({
          where: { name: In(command.categories) },
        });

        if (categories.length > 0) {
          const pivots = categories.map((cat) => ({
            courseId: createdCourse.id!.toString(),
            categoryId: cat.id,
          }));
          await this.categoryCourseRepo
            .createQueryBuilder()
            .insert()
            .into(CategoryCourseOrmEntity)
            .values(pivots)
            .orIgnore()
            .execute();
        }
      }

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
