import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
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

  /** Danh sách active: chỉ loại đề CHƯA xóa mềm. */
  async findAll(): Promise<ExamType[]> {
    const entities = await this.repository.find({
      where: { deletedAt: IsNull() },
    });
    return entities.map((entity) => ExamTypeMapper.toDomain(entity));
  }

  /** Loại đề đã xóa mềm — trang "Đã xóa" của admin (mới xóa lên trước). */
  async findDeleted(): Promise<ExamType[]> {
    const entities = await this.repository.find({
      where: { deletedAt: Not(IsNull()) },
      order: { deletedAt: 'DESC' },
    });
    return entities.map((entity) => ExamTypeMapper.toDomain(entity));
  }

  /** Xóa mềm: chỉ set deleted_at — dữ liệu đề thi liên quan giữ nguyên. */
  async softDelete(id: number): Promise<void> {
    await this.repository.update({ id: id.toString() }, { deletedAt: new Date() });
  }

  /** Bỏ cờ xóa mềm — các đề chưa bị xóa riêng sẽ hiển thị lại. */
  async restore(id: number): Promise<void> {
    await this.repository.update({ id: id.toString() }, { deletedAt: null });
  }

  async create(examType: ExamType): Promise<ExamType> {
    const entity = this.repository.create({
      name: examType.name,
      description: examType.description,
    });
    const saved = await this.repository.save(entity);
    return ExamTypeMapper.toDomain(saved);
  }

  async update(examType: ExamType): Promise<ExamType> {
    const entity = await this.repository.preload({
      id: examType.id!.toString(),
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
