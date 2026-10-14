import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamQuestionGroupOrmEntity } from '../entity/exam-question-group.orm-entity';
import { ExamQuestionGroup } from '../../domain/entity/exam-question-group.entity';
import { IExamQuestionGroupRepository } from '../../domain/repository/exam-question-group.repository';
import { ExamQuestionGroupMapper } from '../mapper/exam-question-group.mapper';

@Injectable()
export class ExamQuestionGroupRepository implements IExamQuestionGroupRepository {
  constructor(
    @InjectRepository(ExamQuestionGroupOrmEntity)
    private readonly repository: Repository<ExamQuestionGroupOrmEntity>,
  ) {}

  async findBySectionId(sectionId: number): Promise<ExamQuestionGroup[]> {
    const entities = await this.repository.find({
      where: { sectionId: sectionId.toString() },
      order: { position: 'ASC' },
    });
    return entities.map(ExamQuestionGroupMapper.toDomain);
  }

  async findById(id: number): Promise<ExamQuestionGroup | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? ExamQuestionGroupMapper.toDomain(entity) : null;
  }

  async save(group: ExamQuestionGroup): Promise<ExamQuestionGroup> {
    const entity = this.repository.create({
      id: group.id ? group.id.toString() : undefined,
      sectionId: group.sectionId.toString(),
      groupType: group.groupType,
      title: group.title,
      instructions: group.instructions,
      position: group.position,
    });
    const saved = await this.repository.save(entity);
    return ExamQuestionGroupMapper.toDomain(saved);
  }

  async saveAll(groups: ExamQuestionGroup[]): Promise<void> {
    const entities = groups.map((g) =>
      this.repository.create({
        id: g.id ? g.id.toString() : undefined,
        sectionId: g.sectionId.toString(),
        groupType: g.groupType,
        title: g.title,
        instructions: g.instructions,
        position: g.position,
      }),
    );
    await this.repository.save(entities);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteAllBySectionId(sectionId: number): Promise<void> {
    await this.repository.delete({ sectionId: sectionId.toString() });
  }
}
