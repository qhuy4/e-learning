import { ForbiddenException, Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import slugify from 'slugify';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { HttpStatus } from '@nestjs/common';

import { UpdateCourseCommand } from '@/modules/courses/application/command/update-course.command';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '@/modules/courses/domain/repository/course.repository';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';
import { AdminCourseDtoMapper } from '@/modules/courses/presentation/mappers/admin-course-dto.mapper';
import { SectionOrmEntity } from '@/modules/sections/infrastructure/entity/section.orm-entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { CategoryOrmEntity } from '@/modules/categories/infrastructure/entity/category.orm-entity';
import { CategoryCourseOrmEntity } from '@/modules/categories/infrastructure/entity/category-course.orm-entity';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { ApprovalStatus } from '@/modules/instructors/domain/enum/instructor-profile.status';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { UserRole } from '@/modules/users/domain/enum/user.role';

const PENDING_REVIEW_STATUS = 2;

@CommandHandler(UpdateCourseCommand)
export class UpdateCourseHandler implements ICommandHandler<UpdateCourseCommand> {
  private readonly logger = new Logger(UpdateCourseHandler.name);

  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,

    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,

    @InjectRepository(SectionOrmEntity)
    private readonly sectionRepo: Repository<SectionOrmEntity>,

    @InjectRepository(LessonOrmEntity)
    private readonly lessonRepo: Repository<LessonOrmEntity>,

    @InjectRepository(CategoryOrmEntity)
    private readonly categoryRepo: Repository<CategoryOrmEntity>,

    @InjectRepository(CategoryCourseOrmEntity)
    private readonly categoryCourseRepo: Repository<CategoryCourseOrmEntity>,
    @InjectRepository(InstructorProfileTypeOrmEntity)
    private readonly profileRepo: Repository<InstructorProfileTypeOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
  ) {}

  async execute(command: UpdateCourseCommand) {
    const course = await this.courseRepository.findById(command.id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const newStatus = command.data.status != null ? Number(command.data.status) : undefined;
    const owner = newStatus !== undefined
      ? await this.userRepo.findOne({ where: { id: Number(course.instructorId) } })
      : null;

    if (owner?.role !== UserRole.ADMIN && newStatus !== undefined && ![1, PENDING_REVIEW_STATUS].includes(newStatus)) {
      throw new ForbiddenException('Giảng viên chỉ có thể lưu bản nháp hoặc gửi khóa học xét duyệt.');
    }

    if (newStatus != null && !isNaN(newStatus) && newStatus === PENDING_REVIEW_STATUS) {
      const profile = await this.profileRepo.findOne({ where: { userId: course.instructorId } });
      if (owner?.role !== UserRole.ADMIN && profile?.approvalStatus !== ApprovalStatus.APPROVED) {
        throw new ForbiddenException('Hồ sơ giảng viên cần được duyệt trước khi gửi khóa học xét duyệt.');
      }
      const sectionCount = await this.sectionRepo.count({
        where: { courseId: String(command.id) },
      });

      if (sectionCount === 0) {
        throw new AppException(ErrorCode.COURSE_NO_SECTIONS, HttpStatus.BAD_REQUEST);
      }

      const lessonCount = await this.lessonRepo
        .createQueryBuilder('lesson')
        .innerJoin('lesson.section', 'section')
        .where('section.courseId = :courseId', { courseId: command.id.toString() })
        .getCount();

      if (lessonCount === 0) {
        throw new AppException(ErrorCode.COURSE_NO_LESSONS, HttpStatus.BAD_REQUEST);
      }
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

      if (command.data.categories !== undefined) {
        const courseIdStr = command.id.toString();
        await this.categoryCourseRepo
          .createQueryBuilder()
          .delete()
          .from(CategoryCourseOrmEntity)
          .where('course_id = :courseId', { courseId: courseIdStr })
          .execute();

        if (command.data.categories.length > 0) {
          const categories = await this.categoryRepo.find({
            where: { name: In(command.data.categories) },
          });

          if (categories.length > 0) {
            const pivots = categories.map((cat) => ({
              courseId: courseIdStr,
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
      }

      if (oldThumbnail) {
        this.storage
          .delete(oldThumbnail)
          .catch((err) =>
            this.logger.warn(`Failed to delete old thumbnail: ${err.message}`),
          );
      }

      return AdminCourseDtoMapper.toDetailDto(updatedCourse, this.storage, this.categoryCourseRepo, this.categoryRepo);
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
