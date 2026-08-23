import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';

import { CourseOrmEntity } from '../../domain/entity/course.orm-entity';
import { CourseStatus } from '../../domain/enum/course-status.enum';

export interface FindCoursesOptions {
  page: number;
  limit: number;
  level?: number;
  keyword?: string;
}

@Injectable()
export class CourseRepository {
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

  async findPublishedById(id: string): Promise<CourseOrmEntity | null> {
    return this.createPublishedQuery()
      .andWhere('course.id = :id', {
        id,
      })
      .getOne();
  }

  async findPublishedBySlug(slug: string): Promise<CourseOrmEntity | null> {
    return this.repository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .where('course.slug = :slug', {
        slug,
      })
      .andWhere('course.status = :status', {
        status: CourseStatus.PUBLISHED,
      })
      .andWhere('course.deletedAt IS NULL')
      .andWhere('section.deletedAt IS NULL')
      .andWhere('section.isActive = true')
      .andWhere('lesson.deletedAt IS NULL')
      .orderBy('section.position', 'ASC')
      .addOrderBy('lesson.position', 'ASC')
      .getOne();
  }

  private createPublishedQuery(): SelectQueryBuilder<CourseOrmEntity> {
    return this.repository
      .createQueryBuilder('course')
      .where('course.status = :status', {
        status: CourseStatus.PUBLISHED,
      });
  }
}
