import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';

import { CourseOrmEntity } from '../entity/course.orm-entity';

import { Course } from '../../domain/entity/course.entity';
import { CourseStatus } from '../../domain/enum/course-status.enum';

import { ICourseRepository } from '../../domain/repository/course.repository';

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

    return this.toDomain(entity);
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

    return this.toDomain(entity);
  }

  async findById(id: number): Promise<Course | null> {
    const entity = await this.repository.findOne({
      where: {
        id: id.toString(),
      },
    });

    if (!entity) {
      return null;
    }

    return this.toDomain(entity);
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

    return this.toDomain(entity);
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

    return this.toDomain(saved);
  }

  async update(course: Course): Promise<Course> {
    const entity = await this.repository.preload({
      id: course.id!.toString(),
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

    if (!entity) {
      throw new Error('Course not found');
    }

    const saved = await this.repository.save(entity);

    return this.toDomain(saved);
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

  private toDomain(entity: CourseOrmEntity): Course {
    return Course.restore({
      id: Number(entity.id),
      instructorId: Number(entity.instructorId),
      title: entity.title,
      slug: entity.slug,
      description: entity.description,
      thumbnail: entity.thumbnail,
      level: entity.level,
      price: Number(entity.price),
      status: entity.status,
      reviewedBy: entity.reviewedBy ? Number(entity.reviewedBy) : null,
      reviewedAt: entity.reviewedAt,
      publishedAt: entity.publishedAt,
      rejectReason: entity.rejectReason,
      parentId: entity.parentId ? Number(entity.parentId) : null,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}
