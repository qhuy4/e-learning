import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { GetRelatedCoursesQuery } from '@/modules/courses/application/query/get-related-courses.query';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { ReviewOrmEntity } from '@/modules/reviews/infrastructure/entity/review.orm-entity';
import { CatalogCourseDto } from '@/modules/courses/presentation/dto/catalog-course.dto';
import { CourseStatus } from '@/modules/courses/domain/enum/course-status.enum';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';

@Injectable()
@QueryHandler(GetRelatedCoursesQuery)
export class GetRelatedCoursesHandler
  implements IQueryHandler<GetRelatedCoursesQuery>
{
  constructor(
    @InjectRepository(CourseOrmEntity)
    private readonly courseRepo: Repository<CourseOrmEntity>,
    @InjectRepository(ReviewOrmEntity)
    private readonly reviewRepo: Repository<ReviewOrmEntity>,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(query: GetRelatedCoursesQuery) {
    const { slug, limit } = query;

    const current = await this.courseRepo.findOne({
      where: { slug, status: CourseStatus.PUBLISHED, deletedAt: IsNull() },
    });

    if (!current) return [];

    const ids = await this.courseRepo
      .createQueryBuilder('course')
      .select('course.id')
      .where('course.status = :status', { status: CourseStatus.PUBLISHED })
      .andWhere('course.deletedAt IS NULL')
      .andWhere('course.id != :currentId', { currentId: current.id })
      .andWhere(
        '(course.level = :level OR course.instructorId = :instructorId)',
        { level: current.level, instructorId: current.instructorId },
      )
      .orderBy('RANDOM()')
      .limit(limit)
      .getRawMany();

    if (ids.length === 0) return [];

    const courseIds = ids.map((i) => i.course_id);

    const courses = await this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructorUser', 'instructorUser')
      .leftJoinAndSelect('instructorUser.profile', 'instructorProfile')
      .where('course.id IN (:...courseIds)', { courseIds })
      .getMany();

    return Promise.all(
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
  }
}
