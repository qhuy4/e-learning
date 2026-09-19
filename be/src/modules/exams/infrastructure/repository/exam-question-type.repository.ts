import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamQuestionTypeOrmEntity } from '../entity/exam-question-type.orm-entity';
import { ExamQuestionType } from '../../domain/entity/exam-question-type.entity';
import { IExamQuestionTypeRepository } from '../../domain/repository/exam-question-type.repository';
import { ExamQuestionTypeMapper } from '../mapper/exam-question-type.mapper';

@Injectable()
export class ExamQuestionTypeRepository implements IExamQuestionTypeRepository {
  constructor(
    @InjectRepository(ExamQuestionTypeOrmEntity)
    private readonly repository: Repository<ExamQuestionTypeOrmEntity>,
  ) {}

  async findById(id: number): Promise<ExamQuestionType | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? ExamQuestionTypeMapper.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<ExamQuestionType | null> {
    const entity = await this.repository.findOne({ where: { code } });
    return entity ? ExamQuestionTypeMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<ExamQuestionType[]> {
    const entities = await this.repository.find();
    return entities.map(ExamQuestionTypeMapper.toDomain);
  }

  async create(examQuestionType: ExamQuestionType): Promise<ExamQuestionType> {
    const entity = this.repository.create({
      code: examQuestionType.code,
      name: examQuestionType.name,
      description: examQuestionType.description,
    });
    const saved = await this.repository.save(entity);
    return ExamQuestionTypeMapper.toDomain(saved);
  }

  async update(examQuestionType: ExamQuestionType): Promise<ExamQuestionType> {
    const entity = await this.repository.preload({
      id: examQuestionType.id!.toString(),
      code: examQuestionType.code,
      name: examQuestionType.name,
      description: examQuestionType.description,
    });
    if (!entity) throw new Error('ExamQuestionType not found');
    const saved = await this.repository.save(entity);
    return ExamQuestionTypeMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
