import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictationAttemptOrmEntity } from '../entity/dictation-attempt.orm-entity';
import { IDictationAttemptRepository } from '../../domain/repository/dictation-attempt.repository';

@Injectable()
export class DictationAttemptRepository implements IDictationAttemptRepository {
  constructor(@InjectRepository(DictationAttemptOrmEntity) private readonly repo: Repository<DictationAttemptOrmEntity>) {}
  async create(attempt: Partial<DictationAttemptOrmEntity>): Promise<DictationAttemptOrmEntity> {
    return this.repo.save(this.repo.create(attempt));
  }
  async update(
    id: number,
    attempt: Partial<DictationAttemptOrmEntity>,
  ): Promise<DictationAttemptOrmEntity | null> {
    await this.repo.update(id.toString(), attempt);
    return this.findById(id);
  }
  async findById(id: number): Promise<DictationAttemptOrmEntity | null> {
    return this.repo.findOne({ where: { id: id.toString() } });
  }
}
