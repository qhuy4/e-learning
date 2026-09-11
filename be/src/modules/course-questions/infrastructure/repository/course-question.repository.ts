import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CourseQuestionOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question.orm-entity';
import { CourseQuestionAnswerOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question-answer.orm-entity';
import { ICourseQuestionRepository } from '@/modules/course-questions/domain/repository/course-question.repository';
import { CourseQuestionMapper } from '@/modules/course-questions/infrastructure/mapper/course-question.mapper';

@Injectable()
export class CourseQuestionRepository implements ICourseQuestionRepository {
  constructor(
    @InjectRepository(CourseQuestionOrmEntity)
    private readonly repository: Repository<CourseQuestionOrmEntity>,
    @InjectRepository(CourseQuestionAnswerOrmEntity)
    private readonly answerRepository: Repository<CourseQuestionAnswerOrmEntity>,
  ) {}

  async findAll(options: {
    page: number;
    limit: number;
    courseId?: number;
    status?: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, courseId, status, keyword, sortBy, sortOrder } = options;

    const query = this.repository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.course', 'course')
      .leftJoinAndSelect('q.user', 'user')
      .leftJoinAndSelect('q.answers', 'answers')
      .leftJoinAndSelect('answers.user', 'answerUser');

    if (courseId) {
      query.andWhere('q.course_id = :courseId', { courseId });
    }

    if (status !== undefined) {
      query.andWhere('q.status = :status', { status });
    }

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('q.content ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('user.name ILIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    const sortableColumns: Record<string, string> = {
      createdAt: 'q.created_at',
      lastActivityAt: 'q.last_activity_at',
    };

    const sortKey = sortBy && sortableColumns[sortBy] ? sortableColumns[sortBy] : 'q.last_activity_at';
    const sortDirection: 'ASC' | 'DESC' = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(sortKey, sortDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    const data = entities.map((entity) => CourseQuestionMapper.toDomain(entity));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
      relations: { course: true, user: true, answers: { user: true } },
      order: { answers: { createdAt: 'ASC' } },
    });
    if (!entity) return null;
    return CourseQuestionMapper.toDomain(entity);
  }

  async updateStatus(id: number, status: number) {
    await this.repository.update(id.toString(), { status });
    return this.findById(id);
  }

  async delete(id: number) {
    await this.repository.delete(id.toString());
  }

  async updateAnswerStatus(id: number, status: number) {
    await this.answerRepository.update(id.toString(), { status });
    const answer = await this.answerRepository.findOne({
      where: { id: id.toString() },
      relations: { user: true },
    });
    return answer;
  }

  async deleteAnswer(id: number) {
    await this.answerRepository.delete(id.toString());
  }
}
