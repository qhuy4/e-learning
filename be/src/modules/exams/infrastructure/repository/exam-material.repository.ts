import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamMaterialOrmEntity } from '../entity/exam-material.orm-entity';
import { ExamMaterial } from '../../domain/entity/exam-material.entity';
import { IExamMaterialRepository } from '../../domain/repository/exam-material.repository';
import { ExamMaterialMapper } from '../mapper/exam-material.mapper';

@Injectable()
export class ExamMaterialRepository implements IExamMaterialRepository {
  constructor(
    @InjectRepository(ExamMaterialOrmEntity)
    private readonly repository: Repository<ExamMaterialOrmEntity>,
  ) {}

  async findBySectionId(sectionId: number): Promise<ExamMaterial[]> {
    const entities = await this.repository.find({
      where: { sectionId: sectionId.toString() },
      order: { position: 'ASC' },
    });
    return entities.map(ExamMaterialMapper.toDomain);
  }

  async findById(id: number): Promise<ExamMaterial | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? ExamMaterialMapper.toDomain(entity) : null;
  }

  async save(material: ExamMaterial): Promise<ExamMaterial> {
    const entity = this.repository.create({
      id: material.id ? material.id.toString() : undefined,
      sectionId: material.sectionId.toString(),
      type: material.type,
      title: material.title,
      content: material.content,
      fileUrl: material.fileUrl,
      transcript: material.transcript,
      position: material.position,
    });
    const saved = await this.repository.save(entity);
    return ExamMaterialMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteAllBySectionId(sectionId: number): Promise<void> {
    await this.repository.delete({ sectionId: sectionId.toString() });
  }
}
