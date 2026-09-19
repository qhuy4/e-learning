import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamOrmEntity } from '../entity/exam.orm-entity';
import { Exam } from '../../domain/entity/exam.entity';
import { IExamRepository } from '../../domain/repository/exam.repository';
import { ExamMapper } from '../mapper/exam.mapper';

@Injectable()
export class ExamRepository implements IExamRepository {
  constructor(
    @InjectRepository(ExamOrmEntity)
    private readonly repository: Repository<ExamOrmEntity>,
  ) {}

  async findById(id: number): Promise<Exam | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? ExamMapper.toDomain(entity) : null;
  }

  async findByStatus(status: string): Promise<Exam[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map(ExamMapper.toDomain);
  }

  async findByCreatedBy(createdBy: number): Promise<Exam[]> {
    const entities = await this.repository.find({ where: { createdBy: createdBy.toString() } });
    return entities.map(ExamMapper.toDomain);
  }

  async findAll(): Promise<Exam[]> {
    const entities = await this.repository.find();
    return entities.map(ExamMapper.toDomain);
  }

  async create(exam: Exam): Promise<Exam> {
    const entity = this.repository.create({
      examFormatId: exam.examFormatId.toString(),
      title: exam.title,
      description: exam.description,
      isPremium: exam.isPremium,
      durationSeconds: exam.durationSeconds,
      status: exam.status,
      createdBy: exam.createdBy ? exam.createdBy.toString() : null,
      publishedAt: exam.publishedAt,
    });
    const saved = await this.repository.save(entity);
    return ExamMapper.toDomain(saved);
  }

  async update(exam: Exam): Promise<Exam> {
    const entity = await this.repository.preload({
      id: exam.id!.toString(),
      examFormatId: exam.examFormatId.toString(),
      title: exam.title,
      description: exam.description,
      isPremium: exam.isPremium,
      durationSeconds: exam.durationSeconds,
      status: exam.status,
      createdBy: exam.createdBy ? exam.createdBy.toString() : null,
      publishedAt: exam.publishedAt,
    });
    if (!entity) throw new Error('Exam not found');
    const saved = await this.repository.save(entity);
    return ExamMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
