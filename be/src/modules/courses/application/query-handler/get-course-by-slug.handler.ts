import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GetCourseBySlugQuery } from '../query/get-course-by-slug.query';
import { CourseRepository } from '../../infrastructure/repository/course.repository';
import { CourseDtoMapper } from '../../presentation/mappers/course-dto.mapper';
import { FILE_STORAGE, FileStorage } from '@/common/storage/domain/interface/file-storage.interface';
import { ReviewOrmEntity } from '@/modules/reviews/infrastructure/entity/review.orm-entity';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';

@QueryHandler(GetCourseBySlugQuery)
@Injectable()
export class GetCourseBySlugHandler implements IQueryHandler<GetCourseBySlugQuery> {
  constructor(
    private readonly courseRepository: CourseRepository,
    @InjectRepository(ReviewOrmEntity)
    private readonly reviewRepo: Repository<ReviewOrmEntity>,
    @InjectRepository(EnrollmentOrmEntity)
    private readonly enrollmentRepo: Repository<EnrollmentOrmEntity>,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(query: GetCourseBySlugQuery) {
    const courseEntity = await this.courseRepository.getCourseDetail(query.slug);
    if (!courseEntity) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const dto = await CourseDtoMapper.toDetailDto(courseEntity, this.storage);

    const stats = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(r.id)', 'count')
      .where('r.course_id = :courseId', { courseId: String(courseEntity.id) })
      .andWhere('r.deleted_at IS NULL')
      .andWhere('(r.status = 1 OR r.status IS NULL)')
      .getRawOne();

    const studentCount = await this.enrollmentRepo.count({
      where: {
        courseId: String(courseEntity.id),
        status: 1,
      },
    });

    const avg = stats?.avg ? Number(parseFloat(stats.avg).toFixed(1)) : 0;
    const count = stats?.count ? Number(stats.count) : 0;

    dto.statistics = {
      studentCount,
      averageRating: avg,
      reviewCount: count,
    };

    return dto;
  }
}
