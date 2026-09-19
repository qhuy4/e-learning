import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizQuestionOrmEntity } from '../entity/quiz-question.orm-entity';
import { QuizQuestion } from '../../domain/entity/quiz-question.entity';
import { IQuizQuestionRepository } from '../../domain/repository/quiz-question.repository';
import { QuizQuestionMapper } from '../mapper/quiz-question.mapper';

@Injectable()
export class QuizQuestionRepository implements IQuizQuestionRepository {
  constructor(@InjectRepository(QuizQuestionOrmEntity) private readonly repository: Repository<QuizQuestionOrmEntity>) {}
  async findByQuizId(quizId: number): Promise<QuizQuestion[]> {
    const entities = await this.repository.find({ where: { quizId: quizId.toString() }, order: { position: 'ASC' } });
    return entities.map(QuizQuestionMapper.toDomain);
  }
}
