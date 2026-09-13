import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ILessonProgressRepository } from '../../domain/repository/lesson-progress.repository';
import { LessonProgress } from '../../domain/entity/lesson-progress.entity';
import { LessonProgressOrmEntity } from '../entity/lesson-progress.orm-entity';

@Injectable()
export class LessonProgressRepository implements ILessonProgressRepository {
  constructor(
    @InjectRepository(LessonProgressOrmEntity)
    private readonly repository: Repository<LessonProgressOrmEntity>,
  ) {}

  async findByUserAndLesson(
    userId: number,
    lessonId: number,
  ): Promise<LessonProgress | null> {
    const entity = await this.repository.findOne({
      where: { userId, lessonId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserAndCourse(
    userId: number,
    courseId: number,
  ): Promise<LessonProgress[]> {
    const entities = await this.repository.find({
      where: { userId, courseId },
      order: { lessonId: 'ASC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async create(lessonProgress: LessonProgress): Promise<LessonProgress> {
    const entity = this.repository.create({
      userId: lessonProgress.userId,
      courseId: lessonProgress.courseId,
      lessonId: lessonProgress.lessonId,
      watchSeconds: lessonProgress.watchSeconds,
      progressPercent: lessonProgress.progressPercent,
      isCompleted: lessonProgress.isCompleted,
      completedAt: lessonProgress.completedAt,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(lessonProgress: LessonProgress): Promise<LessonProgress> {
    const entity = this.repository.create({
      id: lessonProgress.id,
      userId: lessonProgress.userId,
      courseId: lessonProgress.courseId,
      lessonId: lessonProgress.lessonId,
      watchSeconds: lessonProgress.watchSeconds,
      progressPercent: lessonProgress.progressPercent,
      isCompleted: lessonProgress.isCompleted,
      completedAt: lessonProgress.completedAt,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: LessonProgressOrmEntity): LessonProgress {
    return new LessonProgress(
      entity.id,
      entity.userId,
      entity.courseId,
      entity.lessonId,
      entity.watchSeconds,
      entity.progressPercent,
      entity.isCompleted,
      entity.completedAt,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
