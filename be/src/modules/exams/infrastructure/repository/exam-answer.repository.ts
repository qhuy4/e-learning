import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamAnswerOrmEntity } from '../entity/exam-answer.orm-entity';
import { ExamAnswer } from '../../domain/entity/exam-answer.entity';
import { IExamAnswerRepository } from '../../domain/repository/exam-answer.repository';
import { ExamAnswerMapper } from '../mapper/exam-answer.mapper';

@Injectable()
export class ExamAnswerRepository implements IExamAnswerRepository {
  constructor(
    @InjectRepository(ExamAnswerOrmEntity)
    private readonly repository: Repository<ExamAnswerOrmEntity>,
  ) {}

  async findByAttemptId(attemptId: number): Promise<ExamAnswer[]> {
    const entities = await this.repository.find({
      where: { attemptId: attemptId.toString() },
    });
    return entities.map(ExamAnswerMapper.toDomain);
  }

  async saveAll(answers: ExamAnswer[]): Promise<void> {
    const entities = answers.map((a) =>
      this.repository.create({
        id: a.id ? a.id.toString() : undefined,
        attemptId: a.attemptId.toString(),
        questionId: a.questionId.toString(),
        selectedOptionId: a.selectedOptionId ? a.selectedOptionId.toString() : null,
        answerText: a.answerText,
        isCorrect: a.isCorrect,
        earnedPoints: a.earnedPoints,
      }),
    );
    await this.repository.save(entities);
  }

  async deleteByAttemptId(attemptId: number): Promise<void> {
    await this.repository.delete({ attemptId: attemptId.toString() });
  }
}
