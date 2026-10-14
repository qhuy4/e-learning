import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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
      where: { sectionId: sectionId.toString(), groupId: IsNull() },
      order: { position: 'ASC' },
    });
    return entities.map(ExamQuestionMapper.toDomain);
  }

  async findByGroupId(groupId: number): Promise<ExamQuestion[]> {
    const entities = await this.repository.find({
      where: { groupId: groupId.toString() },
      order: { position: 'ASC' },
    });
    return entities.map(ExamQuestionMapper.toDomain);
  }

  async findById(id: number): Promise<ExamQuestion | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? ExamQuestionMapper.toDomain(entity) : null;
  }

  async countBySectionId(sectionId: number): Promise<number> {
    return this.repository.count({ where: { sectionId: sectionId.toString() } });
  }

  async save(question: ExamQuestion): Promise<ExamQuestion> {
    const entity = this.repository.create({
      id: question.id ? question.id.toString() : undefined,
      sectionId: question.sectionId.toString(),
      groupId: question.groupId ? question.groupId.toString() : null,
      type: question.type,
      question: question.question,
      explanation: question.explanation,
      points: question.points,
      position: question.position,
    });
    const saved = await this.repository.save(entity) as ExamQuestionOrmEntity;
    return ExamQuestionMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteAllByGroupId(groupId: number): Promise<void> {
    await this.repository.delete({ groupId: groupId.toString() });
  }

  async deleteAllBySectionId(sectionId: number): Promise<void> {
    await this.repository.delete({ sectionId: sectionId.toString() });
  }
}
