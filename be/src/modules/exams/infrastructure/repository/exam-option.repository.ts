import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamOptionOrmEntity } from '../entity/exam-option.orm-entity';
import { ExamOption } from '../../domain/entity/exam-option.entity';
import { IExamOptionRepository } from '../../domain/repository/exam-option.repository';
import { ExamOptionMapper } from '../mapper/exam-option.mapper';

@Injectable()
export class ExamOptionRepository implements IExamOptionRepository {
  constructor(
    @InjectRepository(ExamOptionOrmEntity)
    private readonly repository: Repository<ExamOptionOrmEntity>,
  ) {}

  async findByQuestionId(questionId: number): Promise<ExamOption[]> {
    const entities = await this.repository.find({
      where: { questionId: questionId.toString() },
      order: { position: 'ASC' },
    });
    return entities.map((entity) => ExamOptionMapper.toDomain(entity));
  }

  async saveAll(options: ExamOption[]): Promise<void> {
    const entities = options.map((o) =>
      this.repository.create({
        id: o.id ? o.id.toString() : undefined,
        questionId: o.questionId.toString(),
        content: o.content,
        isCorrect: o.isCorrect,
        position: o.position,
      }),
    );
    await this.repository.save(entities);
  }

  async deleteAllByQuestionId(questionId: number): Promise<void> {
    await this.repository.delete({ questionId: questionId.toString() });
  }
}
