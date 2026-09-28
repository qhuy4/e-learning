import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonQuizOrmEntity } from '../entity/lesson-quiz.orm-entity';
import { LessonQuiz } from '../../domain/entity/lesson-quiz.entity';
import { ILessonQuizRepository } from '../../domain/repository/lesson-quiz.repository';
import { LessonQuizMapper } from '../mapper/lesson-quiz.mapper';

@Injectable()
export class LessonQuizRepository implements ILessonQuizRepository {
  constructor(@InjectRepository(LessonQuizOrmEntity) private readonly repository: Repository<LessonQuizOrmEntity>) {}

  async findByLessonId(lessonId: number): Promise<LessonQuiz[]> {
    const entities = await this.repository.find({ where: { lessonId: lessonId.toString() } });
    return entities.map(LessonQuizMapper.toDomain);
  }

  async create(lessonQuiz: LessonQuiz): Promise<LessonQuiz> {
    const entity = this.repository.create({
      lessonId: lessonQuiz.lessonId.toString(),
      quizId: lessonQuiz.quizId.toString(),
    });
    const saved = await this.repository.save(entity);
    return LessonQuizMapper.toDomain(saved);
  }

  async delete(lessonId: number, quizId: number): Promise<void> {
    await this.repository.delete({ lessonId: lessonId.toString(), quizId: quizId.toString() });
  }
}
