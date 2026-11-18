import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonDictationOrmEntity } from '../entity/lesson-dictation.orm-entity';
import { ILessonDictationRepository } from '../../domain/repository/lesson-dictation.repository';

@Injectable()
export class LessonDictationRepository implements ILessonDictationRepository {
  constructor(@InjectRepository(LessonDictationOrmEntity) private readonly repo: Repository<LessonDictationOrmEntity>) {}
  async create(lessonId: number, dictationId: number): Promise<void> {
    await this.repo.save(this.repo.create({ lessonId: lessonId.toString(), dictationId: dictationId.toString() }));
  }
  async delete(lessonId: number, dictationId: number): Promise<void> {
    await this.repo.delete({ lessonId: lessonId.toString(), dictationId: dictationId.toString() });
  }
  async findByLessonId(lessonId: number): Promise<LessonDictationOrmEntity[]> {
    return this.repo.find({ where: { lessonId: lessonId.toString() } });
  }
}
