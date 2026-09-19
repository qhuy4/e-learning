import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamQuestionOrmEntity } from '../entity/exam-question.orm-entity';
import { ExamQuestion } from '../../domain/entity/exam-question.entity';
import { IExamQuestionRepository } from '../../domain/repository/exam-question.repository';
import { ExamQuestionMapper } from '../mapper/exam-question.mapper';

@Injectable()
export class ExamQuestionRepository implements IExamQuestionRepository {
  constructor(
    @InjectRepository(ExamQuestionOrmEntity)
    private readonly repository: Repository<ExamQuestionOrmEntity>,
  ) {}

  async findBySectionId(sectionId: number): Promise<ExamQuestion[]> {
    const entities = await this.repository.find({
      where: { sectionId: sectionId.toString() },
      order: { position: 'ASC' },
    });
    return entities.map(ExamQuestionMapper.toDomain);
  }

  async findById(id: number): Promise<ExamQuestion | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? ExamQuestionMapper.toDomain(entity) : null;
  }

  async save(question: ExamQuestion): Promise<ExamQuestion> {
    const entity = this.repository.create({
      id: question.id ? question.id.toString() : undefined,
      sectionId: question.sectionId.toString(),
      materialId: question.materialId ? question.materialId.toString() : null,
      questionTypeId: question.questionTypeId.toString(),
      question: question.question,
      explanation: question.explanation,
      points: question.points,
      position: question.position,
    });
    const saved = await this.repository.save(entity);
    return ExamQuestionMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteAllBySectionId(sectionId: number): Promise<void> {
    await this.repository.delete({ sectionId: sectionId.toString() });
  }
}
