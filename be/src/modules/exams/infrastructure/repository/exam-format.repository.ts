import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamFormatOrmEntity } from '../entity/exam-format.orm-entity';
import { ExamFormat } from '../../domain/entity/exam-format.entity';
import { IExamFormatRepository } from '../../domain/repository/exam-format.repository';
import { ExamFormatMapper } from '../mapper/exam-format.mapper';

@Injectable()
export class ExamFormatRepository implements IExamFormatRepository {
  constructor(
    @InjectRepository(ExamFormatOrmEntity)
    private readonly repository: Repository<ExamFormatOrmEntity>,
  ) {}

  async findById(id: number): Promise<ExamFormat | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? ExamFormatMapper.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<ExamFormat | null> {
    const entity = await this.repository.findOne({ where: { code } });
    return entity ? ExamFormatMapper.toDomain(entity) : null;
  }

  async findByExamTypeId(examTypeId: number): Promise<ExamFormat[]> {
    const entities = await this.repository.find({ where: { examTypeId: examTypeId.toString() } });
    return entities.map(ExamFormatMapper.toDomain);
  }

  async findAll(): Promise<ExamFormat[]> {
    const entities = await this.repository.find();
    return entities.map(ExamFormatMapper.toDomain);
  }

  async create(examFormat: ExamFormat): Promise<ExamFormat> {
    const entity = this.repository.create({
      examTypeId: examFormat.examTypeId.toString(),
      code: examFormat.code,
      name: examFormat.name,
      version: examFormat.version.toString(),
      description: examFormat.description,
      durationSeconds: examFormat.durationSeconds,
      isActive: examFormat.isActive,
      effectiveFrom: examFormat.effectiveFrom,
      effectiveTo: examFormat.effectiveTo,
    });
    const saved = await this.repository.save(entity);
    return ExamFormatMapper.toDomain(saved);
  }

  async update(examFormat: ExamFormat): Promise<ExamFormat> {
    const entity = await this.repository.preload({
      id: examFormat.id!.toString(),
      examTypeId: examFormat.examTypeId.toString(),
      code: examFormat.code,
      name: examFormat.name,
      version: examFormat.version.toString(),
      description: examFormat.description,
      durationSeconds: examFormat.durationSeconds,
      isActive: examFormat.isActive,
      effectiveFrom: examFormat.effectiveFrom,
      effectiveTo: examFormat.effectiveTo,
    });
    if (!entity) throw new Error('ExamFormat not found');
    const saved = await this.repository.save(entity);
    return ExamFormatMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
