import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DictationOrmEntity,
  DictationLevel,
} from '../entity/dictation.orm-entity';
import { IDictationRepository } from '../../domain/repository/dictation.repository';
import { Dictation } from '../../domain/entity/dictation.entity';

@Injectable()
export class DictationRepository implements IDictationRepository {
  constructor(
    @InjectRepository(DictationOrmEntity)
    private readonly repo: Repository<DictationOrmEntity>,
  ) {}

  async create(dictation: Dictation): Promise<Dictation> {
    const saved = await this.repo.save(
      this.repo.create({
        ...dictation,
        level: dictation.level as DictationLevel,
      }),
    );
    return saved;
  }
  async update(
    id: number,
    data: Partial<Dictation>,
  ): Promise<Dictation | null> {
    const { level, ...rest } = data;
    await this.repo.update(id.toString(), {
      ...rest,
      ...(level !== undefined ? { level: level as DictationLevel } : {}),
    });
    return this.findById(id);
  }
  async delete(id: number): Promise<void> {
    await this.repo.delete(id.toString());
  }
  async findById(id: number): Promise<Dictation | null> {
    return this.repo.findOne({ where: { id: id.toString() } });
  }
  async findByCreator(userId: number): Promise<Dictation[]> {
    return this.repo.find({ where: { createdBy: userId.toString() } });
  }
  async findAll(): Promise<Dictation[]> {
    return this.repo.find();
  }
}
