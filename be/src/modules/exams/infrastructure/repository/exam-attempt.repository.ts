import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamAttemptOrmEntity } from '../entity/exam-attempt.orm-entity';
import { ExamAttempt } from '../../domain/entity/exam-attempt.entity';
import { IExamAttemptRepository } from '../../domain/repository/exam-attempt.repository';
import { ExamAttemptMapper } from '../mapper/exam-attempt.mapper';

@Injectable()
export class ExamAttemptRepository implements IExamAttemptRepository {
  constructor(
    @InjectRepository(ExamAttemptOrmEntity)
    private readonly repository: Repository<ExamAttemptOrmEntity>,
  ) {}

  async findById(id: number): Promise<ExamAttempt | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? ExamAttemptMapper.toDomain(entity) : null;
  }

  async findByExamAndUser(examId: number, userId: number): Promise<ExamAttempt | null> {
    const entity = await this.repository.findOne({
      where: { examId: examId.toString(), userId: userId.toString() },
    });
    return entity ? ExamAttemptMapper.toDomain(entity) : null;
  }

  async create(attempt: ExamAttempt): Promise<ExamAttempt> {
    const entity = this.repository.create({
      examId: attempt.examId.toString(),
      userId: attempt.userId.toString(),
      score: attempt.score,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      status: attempt.status,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
    });
    const saved = await this.repository.save(entity);
    return ExamAttemptMapper.toDomain(saved);
  }

  async update(attempt: ExamAttempt): Promise<ExamAttempt> {
    const entity = await this.repository.preload({
      id: attempt.id!.toString(),
      score: attempt.score,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      status: attempt.status,
      submittedAt: attempt.submittedAt,
    });
    if (!entity) throw new Error('ExamAttempt not found');
    const saved = await this.repository.save(entity);
    return ExamAttemptMapper.toDomain(saved);
  }
}
