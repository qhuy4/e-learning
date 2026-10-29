import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ILessonNoteRepository } from '../../domain/repository/lesson-note.repository';
import { LessonNote } from '../../domain/entity/lesson-note.entity';
import { LessonNoteOrmEntity } from '../entity/lesson-note.orm-entity';

@Injectable()
export class LessonNoteRepository implements ILessonNoteRepository {
  constructor(
    @InjectRepository(LessonNoteOrmEntity)
    private readonly repository: Repository<LessonNoteOrmEntity>,
  ) {}

  async findByUserAndLesson(
    userId: number,
    lessonId: number,
  ): Promise<LessonNote[]> {
    const entities = await this.repository.find({
      where: { userId, lessonId },
      order: { noteTimeSeconds: 'ASC', id: 'ASC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByIdForUser(
    id: number,
    userId: number,
  ): Promise<LessonNote | null> {
    const entity = await this.repository.findOne({ where: { id, userId } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(note: LessonNote): Promise<LessonNote> {
    const entity = this.repository.create({
      userId: note.userId,
      lessonId: note.lessonId,
      noteTimeSeconds: note.noteTimeSeconds,
      content: note.content,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(note: LessonNote): Promise<LessonNote> {
    const entity = this.repository.create({
      id: note.id,
      userId: note.userId,
      lessonId: note.lessonId,
      noteTimeSeconds: note.noteTimeSeconds,
      content: note.content,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }

  private toDomain(entity: LessonNoteOrmEntity): LessonNote {
    return new LessonNote(
      entity.id,
      entity.userId,
      entity.lessonId,
      entity.noteTimeSeconds,
      entity.content,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
