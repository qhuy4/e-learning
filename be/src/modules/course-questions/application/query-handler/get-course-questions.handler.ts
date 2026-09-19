import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetCourseQuestionsQuery } from '@/modules/course-questions/application/query/get-course-questions.query';
import { CourseQuestionOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question.orm-entity';

@QueryHandler(GetCourseQuestionsQuery)
export class GetCourseQuestionsHandler implements IQueryHandler<GetCourseQuestionsQuery> {
  constructor(
    @InjectRepository(CourseQuestionOrmEntity)
    private readonly repo: Repository<CourseQuestionOrmEntity>,
  ) {}

  async execute(query: GetCourseQuestionsQuery) {
    const { courseId, options } = query;
    const { page, limit, status } = options;

    const qb = this.repo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.user', 'user')
      .where('q.course_id = :courseId', { courseId });

    if (status !== undefined) {
      qb.andWhere('q.status = :status', { status });
    }

    qb.orderBy('q.last_activity_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();

    const ids = entities.map((e) => Number(e.id));
    let answerCounts: Record<number, number> = {};
    if (ids.length > 0) {
      const counts = await this.repo.query(
        `SELECT question_id, COUNT(*)::int AS count FROM course_question_answers WHERE question_id = ANY($1) GROUP BY question_id`,
        [ids.map(String)],
      );
      for (const row of counts as any[]) {
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
      user: q.user ? { id: Number(q.user.id), name: q.user.name } : undefined,
      answerCount: answerCounts[Number(q.id)] ?? 0,
    }));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
