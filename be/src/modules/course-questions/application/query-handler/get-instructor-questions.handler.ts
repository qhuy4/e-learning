import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { GetInstructorQuestionsQuery } from '@/modules/course-questions/application/query/get-instructor-questions.query';
import { CourseQuestionOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question.orm-entity';

@QueryHandler(GetInstructorQuestionsQuery)
export class GetInstructorQuestionsHandler implements IQueryHandler<GetInstructorQuestionsQuery> {
  constructor(
    @InjectRepository(CourseQuestionOrmEntity)
    private readonly repo: Repository<CourseQuestionOrmEntity>,
  ) {}

  async execute(query: GetInstructorQuestionsQuery) {
    const { instructorId, options } = query;
    const { page, limit, courseId, status, keyword } = options;

    const qb = this.repo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.course', 'course')
      .leftJoinAndSelect('q.user', 'user')
      .where('course.instructor_id = :instructorId', { instructorId });

    if (courseId) {
      qb.andWhere('q.course_id = :courseId', { courseId });
    }

    if (status !== undefined) {
      qb.andWhere('q.status = :status', { status });
    }

    if (keyword) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('q.content ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('user.name ILIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    qb.orderBy('q.last_activity_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();

    const ids = entities.map((e) => Number(e.id));
    const answerCounts: Record<number, number> = {};
    if (ids.length > 0) {
      const counts = await this.repo.query<
        Array<{ question_id: string; count: number }>
      >(
        `SELECT question_id, COUNT(*)::int AS count FROM course_question_answers WHERE question_id = ANY($1) GROUP BY question_id`,
        [ids.map(String)],
      );
      for (const row of counts) {
        answerCounts[Number(row.question_id)] = row.count;
      }
    }

    const data = entities.map((q) => ({
      id: Number(q.id),
      courseId: Number(q.courseId),
      userId: Number(q.userId),
      content: q.content,
      status: q.status,
      lastActivityAt: q.lastActivityAt,
      createdAt: q.createdAt,
      course: q.course
        ? { id: Number(q.course.id), title: q.course.title }
        : undefined,
      user: q.user ? { id: Number(q.user.id), name: q.user.name } : undefined,
      answerCount: answerCounts[Number(q.id)] ?? 0,
    }));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
