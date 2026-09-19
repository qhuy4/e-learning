import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamTypeOrmEntity } from '../entity/exam-type.orm-entity';
import { ExamType } from '../../domain/entity/exam-type.entity';
import { IExamTypeRepository } from '../../domain/repository/exam-type.repository';
import { ExamTypeMapper } from '../mapper/exam-type.mapper';

@Injectable()
export class ExamTypeRepository implements IExamTypeRepository {
  constructor(
    @InjectRepository(ExamTypeOrmEntity)
    private readonly repository: Repository<ExamTypeOrmEntity>,
  ) {}

  async findById(id: number): Promise<ExamType | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? ExamTypeMapper.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<ExamType | null> {
    const entity = await this.repository.findOne({ where: { code } });
    return entity ? ExamTypeMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<ExamType[]> {
    const entities = await this.repository.find();
    return entities.map(ExamTypeMapper.toDomain);
  }

  async create(examType: ExamType): Promise<ExamType> {
    const entity = this.repository.create({
      code: examType.code,
      name: examType.name,
      description: examType.description,
    });
    const saved = await this.repository.save(entity);
    return ExamTypeMapper.toDomain(saved);
  }

  async update(examType: ExamType): Promise<ExamType> {
    const entity = await this.repository.preload({
      id: examType.id!.toString(),
      code: examType.code,
      name: examType.name,
      description: examType.description,
    });
    if (!entity) throw new Error('ExamType not found');
    const saved = await this.repository.save(entity);
    return ExamTypeMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
