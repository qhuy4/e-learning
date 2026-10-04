import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamSectionOrmEntity } from '../entity/exam-section.orm-entity';
import { ExamSection } from '../../domain/entity/exam-section.entity';
import { IExamSectionRepository } from '../../domain/repository/exam-section.repository';
import { ExamSectionMapper } from '../mapper/exam-section.mapper';

@Injectable()
export class ExamSectionRepository implements IExamSectionRepository {
  constructor(
    @InjectRepository(ExamSectionOrmEntity)
    private readonly repository: Repository<ExamSectionOrmEntity>,
  ) {}

  async findById(id: number): Promise<ExamSection | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? ExamSectionMapper.toDomain(entity) : null;
  }

  async findByExamId(examId: number): Promise<ExamSection[]> {
    const entities = await this.repository.find({
      where: { examId: examId.toString() },
      order: { position: 'ASC' },
    });
    return entities.map(ExamSectionMapper.toDomain);
  }

  async saveAll(sections: ExamSection[]): Promise<void> {
    const entities = sections.map((s) =>
      this.repository.create({
        id: s.id ? s.id.toString() : undefined,
        examId: s.examId.toString(),
        formatSectionId: s.formatSectionId.toString(),
        name: s.name,
        description: s.description,
        instructions: s.instructions,
        position: s.position,
        durationSeconds: s.durationSeconds,
        questionCount: s.questionCount,
        sectionType: s.sectionType,
      }),
    );
    await this.repository.save(entities);
  }

  async deleteAllByExamId(examId: number): Promise<void> {
    await this.repository.delete({ examId: examId.toString() });
  }
}
