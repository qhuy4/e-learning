import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictationSentenceOrmEntity } from '../entity/dictation-sentence.orm-entity';
import { IDictationSentenceRepository } from '../../domain/repository/dictation-sentence.repository';

@Injectable()
export class DictationSentenceRepository implements IDictationSentenceRepository {
  constructor(@InjectRepository(DictationSentenceOrmEntity) private readonly repo: Repository<DictationSentenceOrmEntity>) {}
  async findByDictationId(dictationId: number): Promise<any[]> {
    return this.repo.find({ where: { dictationId: dictationId.toString() } });
  }
  async saveAll(sentences: any[]): Promise<any[]> {
    for (const s of sentences) {
      await this.repo.save(this.repo.create(s));
    }
    return sentences;
  }
  async deleteAllByDictationId(dictationId: number): Promise<void> {
    await this.repo.delete({ dictationId: dictationId.toString() });
  }
}
