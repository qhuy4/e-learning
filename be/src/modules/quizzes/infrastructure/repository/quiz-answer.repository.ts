import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAnswerOrmEntity } from '../entity/quiz-answer.orm-entity';
import { QuizAnswer } from '../../domain/entity/quiz-answer.entity';
import { IQuizAnswerRepository } from '../../domain/repository/quiz-answer.repository';
import { QuizAnswerMapper } from '../mapper/quiz-answer.mapper';

@Injectable()
export class QuizAnswerRepository implements IQuizAnswerRepository {
  constructor(@InjectRepository(QuizAnswerOrmEntity) private readonly repository: Repository<QuizAnswerOrmEntity>) {}
  async saveAll(answers: QuizAnswer[]): Promise<void> {
    const entities = answers.map(a => this.repository.create({
      attemptId: a.attemptId.toString(),
      questionId: a.questionId.toString(),
      selectedOptionId: a.selectedOptionId ? a.selectedOptionId.toString() : null,
      answerText: a.answerText,
      isCorrect: a.isCorrect,
      earnedPoints: a.earnedPoints,
    }));
    await this.repository.save(entities);
  }

  async findByAttemptId(attemptId: number): Promise<QuizAnswer[]> {
    const entities = await this.repository.find({
      where: { attemptId: attemptId.toString() },
    });
    return entities.map(QuizAnswerMapper.toDomain);
  }
}
