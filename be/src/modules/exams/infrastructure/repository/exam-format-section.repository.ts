import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamFormatSectionOrmEntity } from '../entity/exam-format-section.orm-entity';
import { ExamFormatSection } from '../../domain/entity/exam-format-section.entity';
import { IExamFormatSectionRepository } from '../../domain/repository/exam-format-section.repository';
import { ExamFormatSectionMapper } from '../mapper/exam-format-section.mapper';

@Injectable()
export class ExamFormatSectionRepository implements IExamFormatSectionRepository {
  constructor(
    @InjectRepository(ExamFormatSectionOrmEntity)
    private readonly repository: Repository<ExamFormatSectionOrmEntity>,
  ) {}

  async findByExamFormatId(examFormatId: number): Promise<ExamFormatSection[]> {
    const entities = await this.repository.find({
      where: { examFormatId: examFormatId.toString() },
      order: { position: 'ASC' },
    });
    return entities.map(ExamFormatSectionMapper.toDomain);
  }

  async saveAll(sections: ExamFormatSection[]): Promise<void> {
    const entities = sections.map((s) =>
      this.repository.create({
        id: s.id ? s.id.toString() : undefined,
        examFormatId: s.examFormatId.toString(),
        code: s.code,
        name: s.name,
        description: s.description,
        instructions: s.instructions,
        position: s.position,
        durationSeconds: s.durationSeconds,
        questionCount: s.questionCount,
      }),
    );
    await this.repository.save(entities);
  }

  async deleteAllByExamFormatId(examFormatId: number): Promise<void> {
    await this.repository.delete({ examFormatId: examFormatId.toString() });
  }
}
