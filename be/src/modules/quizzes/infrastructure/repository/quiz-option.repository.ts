import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { QuizOptionOrmEntity } from '../entity/quiz-option.orm-entity';
import { QuizOption } from '../../domain/entity/quiz-option.entity';
import { IQuizOptionRepository } from '../../domain/repository/quiz-option.repository';
import { QuizOptionMapper } from '../mapper/quiz-option.mapper';

@Injectable()
export class QuizOptionRepository implements IQuizOptionRepository {
  constructor(@InjectRepository(QuizOptionOrmEntity) private readonly repository: Repository<QuizOptionOrmEntity>) {}
  async findByQuestionIds(questionIds: number[]): Promise<QuizOption[]> {
    if (!questionIds.length) return [];
    const entities = await this.repository.find({ 
      where: { questionId: In(questionIds.map(id => id.toString())) } 
    });
    return entities.map((entity) => QuizOptionMapper.toDomain(entity));
  }
}
