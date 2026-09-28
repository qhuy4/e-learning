import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictationOrmEntity } from '../entity/dictation.orm-entity';
import { IDictationRepository } from '../../domain/repository/dictation.repository';
import { Dictation } from '../../domain/entity/dictation.entity';

@Injectable()
export class DictationRepository implements IDictationRepository {
  constructor(@InjectRepository(DictationOrmEntity) private readonly repo: Repository<DictationOrmEntity>) {}

  async create(dictation: Dictation): Promise<Dictation> {
    const saved = await this.repo.save(this.repo.create(dictation as any));
    return saved as any;
  }
  async update(id: number, data: Partial<Dictation>): Promise<Dictation> {
    await this.repo.update(id.toString(), data as any);
    return this.findById(id) as any;
  }
  async delete(id: number): Promise<void> {
    await this.repo.delete(id.toString());
  }
  async findById(id: number): Promise<Dictation | null> {
    return this.repo.findOne({ where: { id: id.toString() } }) as any;
  }
  async findByCreator(userId: number): Promise<Dictation[]> {
    return this.repo.find({ where: { createdBy: userId.toString() } }) as any;
  }
  async findAll(): Promise<Dictation[]> {
    return this.repo.find() as any;
  }
}
