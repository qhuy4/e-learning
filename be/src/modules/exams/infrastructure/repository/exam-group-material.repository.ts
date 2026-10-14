import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamGroupMaterialOrmEntity } from '../entity/exam-group-material.orm-entity';
import { ExamGroupMaterial } from '../../domain/entity/exam-group-material.entity';
import { IExamGroupMaterialRepository } from '../../domain/repository/exam-group-material.repository';
import { ExamGroupMaterialMapper } from '../mapper/exam-group-material.mapper';

@Injectable()
export class ExamGroupMaterialRepository implements IExamGroupMaterialRepository {
  constructor(
    @InjectRepository(ExamGroupMaterialOrmEntity)
    private readonly repository: Repository<ExamGroupMaterialOrmEntity>,
  ) {}

  async findByGroupId(groupId: number): Promise<ExamGroupMaterial[]> {
    const entities = await this.repository.find({
      where: { groupId: groupId.toString() },
      order: { position: 'ASC' },
    });
    return entities.map(ExamGroupMaterialMapper.toDomain);
  }

  async findById(id: number): Promise<ExamGroupMaterial | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? ExamGroupMaterialMapper.toDomain(entity) : null;
  }

  async save(material: ExamGroupMaterial): Promise<ExamGroupMaterial> {
    const entity = this.repository.create({
      id: material.id ? material.id.toString() : undefined,
      groupId: material.groupId.toString(),
      type: material.type,
      title: material.title,
      content: material.content,
      fileUrl: material.fileUrl,
      transcript: material.transcript,
      position: material.position,
    });
    const saved = await this.repository.save(entity) as ExamGroupMaterialOrmEntity;
    return ExamGroupMaterialMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteAllByGroupId(groupId: number): Promise<void> {
    await this.repository.delete({ groupId: groupId.toString() });
  }
}
