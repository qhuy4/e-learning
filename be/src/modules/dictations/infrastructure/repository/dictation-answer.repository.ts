import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictationAnswerOrmEntity } from '../entity/dictation-answer.orm-entity';
import { IDictationAnswerRepository } from '../../domain/repository/dictation-answer.repository';

@Injectable()
export class DictationAnswerRepository implements IDictationAnswerRepository {
  constructor(@InjectRepository(DictationAnswerOrmEntity) private readonly repo: Repository<DictationAnswerOrmEntity>) {}
  async saveAll(answers: any[]): Promise<any[]> {
    for (const a of answers) {
      await this.repo.save(this.repo.create(a));
    }
    return answers;
  }
}
