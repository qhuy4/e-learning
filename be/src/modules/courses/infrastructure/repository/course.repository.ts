import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { CourseOrmEntity } from '../entity/course.orm-entity';
import { Course } from '../../domain/entity/course.entity';
import { CourseStatus } from '../../domain/enum/course-status.enum';
import { ICourseRepository } from '../../domain/repository/course.repository';
import { CourseMapper } from '../mapper/course.mapper';

export interface FindCoursesOptions {
  page: number;
  limit: number;
  level?: number;
  keyword?: string;
}

@Injectable()
export class CourseRepository implements ICourseRepository {
  constructor(
    @InjectRepository(CourseOrmEntity)
    private readonly repository: Repository<CourseOrmEntity>,
  ) {}

  async findPublishedCourses(options: FindCoursesOptions) {
    const { page, limit, level, keyword } = options;

    const query = this.createPublishedQuery();

    if (level) {
      query.andWhere('course.level = :level', {
        level,
      });
    }

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('course.title ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('course.description ILIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    query
      .orderBy('course.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return query.getManyAndCount();
  }

  async findCourseOrmEntityPublishedById(
    id: number,
  ): Promise<CourseOrmEntity | null> {
    return this.createPublishedQuery()
      .andWhere('course.id = :id', {
        id: id.toString(),
      })
      .getOne();
  }

  async findPublishedById(id: number): Promise<Course | null> {
    const entity = await this.findCourseOrmEntityPublishedById(id);

    if (!entity) {
      return null;
    }

    return CourseMapper.toDomain(entity);
  }

  async getCourseDetail(slug: string): Promise<CourseOrmEntity | null> {
    return this.repository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .where('course.slug = :slug', { slug })
      .andWhere('course.status = :status', { status: CourseStatus.PUBLISHED })
      .andWhere('course.deletedAt IS NULL')
      .andWhere('section.deletedAt IS NULL')
      .andWhere('section.isActive = true')
      .andWhere('lesson.deletedAt IS NULL')
      .orderBy('section.position', 'ASC')
      .addOrderBy('lesson.position', 'ASC')
      .getOne();
  }

  async findPublishedBySlug(slug: string): Promise<Course | null> {
    const entity = await this.getCourseDetail(slug);

    if (!entity) {
      return null;
    }

    return CourseMapper.toDomain(entity);
  }

  async findById(id: number): Promise<Course | null> {
    const entity = await this.findOrmEntityById(id);

    if (!entity) {
      return null;
    }

    return CourseMapper.toDomain(entity);
  }

  private async findOrmEntityById(id: number): Promise<CourseOrmEntity | null> {
    return this.repository
      .createQueryBuilder('course')
      .leftJoinAndSelect(
        'course.sections',
        'section',
        'section.deletedAt IS NULL AND section.isActive = true',
      )
      .leftJoinAndSelect(
        'section.lessons',
        'lesson',
        'lesson.deletedAt IS NULL',
      )
      .where('course.id = :id', { id })
      .andWhere('course.deletedAt IS NULL')
      .orderBy('section.position', 'ASC')
      .addOrderBy('lesson.position', 'ASC')
      .getOne();
  }

  async findBySlug(slug: string): Promise<Course | null> {
    const entity = await this.repository.findOne({
      where: {
        slug,
      },
    });

    if (!entity) {
      return null;
    }

    return CourseMapper.toDomain(entity);
  }

  async create(course: Course): Promise<Course> {
    const entity = this.repository.create({
      instructorId: course.instructorId.toString(),
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnail: course.thumbnail,
      level: course.level,
      price: course.price.toString(),
      status: course.status,
      reviewedBy: course.reviewedBy?.toString(),
      reviewedAt: course.reviewedAt,
      publishedAt: course.publishedAt,
      rejectReason: course.rejectReason,
      parentId: course.parentId?.toString(),
      version: course.version,
    });

    const saved = await this.repository.save(entity);

    return CourseMapper.toDomain(saved);
  }

  async update(course: Course): Promise<Course> {
    await this.repository.update(
      { id: course.id!.toString() },
      {
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnail: course.thumbnail,
        level: course.level,
        price: course.price.toString(),
        status: course.status,
        reviewedBy: course.reviewedBy?.toString() ?? null,
        reviewedAt: course.reviewedAt,
        publishedAt: course.publishedAt,
        rejectReason: course.rejectReason,
        parentId: course.parentId?.toString() ?? null,
        version: course.version,
      },
    );
    const updated = await this.findOrmEntityById(Number(course.id));
    if (!updated) throw new Error('Course not found after update');

    return CourseMapper.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  private createPublishedQuery(): SelectQueryBuilder<CourseOrmEntity> {
    return this.repository
      .createQueryBuilder('course')
      .where('course.status = :status', {
        status: CourseStatus.PUBLISHED,
      })
      .andWhere('course.deletedAt IS NULL');
  }

  async findAllCourses(options: FindCoursesOptions & { status?: number }) {
    const { page, limit, level, keyword, status } = options;

    const query = this.repository
      .createQueryBuilder('course')
      .where('course.deletedAt IS NULL');

    if (level) {
      query.andWhere('course.level = :level', { level });
    }
    if (status) {
      query.andWhere('course.status = :status', { status });
    }

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('course.title ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('course.description ILIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    query
      .orderBy('course.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return query.getManyAndCount();
  }
}
