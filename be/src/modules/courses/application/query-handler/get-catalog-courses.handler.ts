import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';

import { GetCatalogCoursesQuery } from '@/modules/courses/application/query/get-catalog-courses.query';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { ReviewOrmEntity } from '@/modules/reviews/infrastructure/entity/review.orm-entity';
import { CatalogCourseDto } from '@/modules/courses/presentation/dto/catalog-course.dto';
import { CourseStatus } from '@/modules/courses/domain/enum/course-status.enum';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';

@Injectable()
@QueryHandler(GetCatalogCoursesQuery)
export class GetCatalogCoursesHandler
  implements IQueryHandler<GetCatalogCoursesQuery>
{
  constructor(
    @InjectRepository(CourseOrmEntity)
    private readonly courseRepo: Repository<CourseOrmEntity>,
    @InjectRepository(ReviewOrmEntity)
    private readonly reviewRepo: Repository<ReviewOrmEntity>,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(query: GetCatalogCoursesQuery) {
    const {
      page,
      limit,
      keyword,
      levels,
      price,
      minPrice,
      maxPrice,
      minRating,
      sort,
    } = query;

    const qb = this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructorUser', 'instructorUser')
      .leftJoinAndSelect('instructorUser.profile', 'instructorProfile')
      .where('course.status = :status', { status: CourseStatus.PUBLISHED })
      .andWhere('course.deletedAt IS NULL');

    if (keyword) {
      qb.andWhere(
        new Brackets((q) => {
          q.where('course.title ILIKE :kw', { kw: `%${keyword}%` });
        }),
      );
    }

    if (levels && levels.length > 0) {
      qb.andWhere('course.level IN (:...levels)', { levels });
    }

    if (price === 'free') {
      qb.andWhere('course.price = 0');
    } else if (price === 'paid') {
      qb.andWhere('course.price > 0');
    }

    if (minPrice !== undefined) {
      qb.andWhere('course.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('course.price <= :maxPrice', { maxPrice });
    }

    if (minRating && minRating > 0) {
      const ratingSubQb = this.reviewRepo
        .createQueryBuilder('r')
        .select('AVG(r.rating)', 'avg')
        .where('r.course_id = course.id')
        .andWhere('r.deletedAt IS NULL')
        .andWhere('r.status = 1');
      qb.andWhere(`(${ratingSubQb.getQuery()}) >= :minRating`, { minRating });
      qb.setParameters({ minRating });
    }

    if (sort === 'newest') {
      qb.orderBy('course.createdAt', 'DESC');
    } else if (sort === 'price-asc') {
      qb.orderBy('course.price', 'ASC');
    } else if (sort === 'price-desc') {
      qb.orderBy('course.price', 'DESC');
    } else {
      qb.orderBy('course.updatedAt', 'DESC');
    }

    const [courses, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = await Promise.all(
      courses.map(async (entity) => {
        const stats = await this.reviewRepo
          .createQueryBuilder('r')
          .select('AVG(r.rating)', 'avg')
          .addSelect('COUNT(r.id)', 'count')
          .where('r.course_id = :courseId', { courseId: entity.id })
          .andWhere('r.deletedAt IS NULL')
          .andWhere('r.status = 1')
          .getRawOne();

        return CatalogCourseDto.fromEntity(
          entity,
          this.storage,
          Number(stats?.avg) || 0,
          Number(stats?.count) || 0,
        );
      }),
    );

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
