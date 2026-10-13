import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttemptOrmEntity } from '../entity/quiz-attempt.orm-entity';
import { QuizAttempt } from '../../domain/entity/quiz-attempt.entity';
import { QuizAttemptStatus } from '../../domain/enums/quiz-attempt-status.enum';
import { IQuizAttemptRepository } from '../../domain/repository/quiz-attempt.repository';
import { QuizAttemptMapper } from '../mapper/quiz-attempt.mapper';

@Injectable()
export class QuizAttemptRepository implements IQuizAttemptRepository {
  constructor(@InjectRepository(QuizAttemptOrmEntity) private readonly repository: Repository<QuizAttemptOrmEntity>) {}

  async findById(id: number): Promise<QuizAttempt | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? QuizAttemptMapper.toDomain(entity) : null;
  }

  async create(attempt: QuizAttempt): Promise<QuizAttempt> {
    const entity = this.repository.create({
      quizId: attempt.quizId.toString(),
      userId: attempt.userId.toString(),
      status: attempt.status,
    });
    const saved = await this.repository.save(entity);
    return QuizAttemptMapper.toDomain(saved);
  }

  async update(attempt: QuizAttempt): Promise<QuizAttempt> {
    const entity = await this.repository.preload({
      id: attempt.id!.toString(),
      score: attempt.score,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      status: attempt.status,
      submittedAt: attempt.submittedAt,
    });
    const saved = await this.repository.save(entity!);
    return QuizAttemptMapper.toDomain(saved);
  }

  async countByQuizAndUser(quizId: number, userId: number): Promise<number> {
    return this.repository.count({
      where: {
        quizId: quizId.toString(),
        userId: userId.toString(),
        status: QuizAttemptStatus.SUBMITTED,
      },
    });
  }
}
