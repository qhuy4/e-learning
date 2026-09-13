import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetHomeCoursesQuery } from '@/modules/home/application/query/get-home-courses.query';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { CourseStatus } from '@/modules/courses/domain/enum/course-status.enum';

@QueryHandler(GetHomeCoursesQuery)
export class GetHomeCoursesHandler implements IQueryHandler<GetHomeCoursesQuery> {
  constructor(
    @InjectRepository(CourseOrmEntity)
    private readonly courseRepo: Repository<CourseOrmEntity>,
  ) {}

  async execute(query: GetHomeCoursesQuery) {
    const courses = await this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructorUser', 'instructorUser')
      .where('course.status = :status', { status: CourseStatus.PUBLISHED })
      .andWhere('course.deletedAt IS NULL')
      .orderBy('course.createdAt', 'DESC')
      .take(query.limit)
      .getMany();

    return courses.map((c) => ({
      id: Number(c.id),
      title: c.title,
      slug: c.slug,
      thumbnail: c.thumbnail,
      level: Number(c.level),
      price: Number(c.price),
      instructorName: (c as any).instructorUser?.name ?? null,
    }));
  }
}
