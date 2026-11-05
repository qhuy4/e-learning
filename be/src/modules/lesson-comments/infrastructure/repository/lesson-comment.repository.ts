import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ILessonCommentRepository } from '../../domain/repository/lesson-comment.repository';
import { LessonComment } from '../../domain/entity/lesson-comment.entity';
import { LessonCommentOrmEntity } from '../entity/lesson-comment.orm-entity';

@Injectable()
export class LessonCommentRepository implements ILessonCommentRepository {
  constructor(
    @InjectRepository(LessonCommentOrmEntity)
    private readonly repository: Repository<LessonCommentOrmEntity>,
  ) {}

  async findById(id: number): Promise<LessonComment | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(comment: LessonComment): Promise<LessonComment> {
    const entity = this.repository.create({
      lessonId: comment.lessonId,
      userId: comment.userId,
      parentId: comment.parentId,
      content: comment.content,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(comment: LessonComment): Promise<LessonComment> {
    const entity = this.repository.create({
      id: comment.id,
      lessonId: comment.lessonId,
      userId: comment.userId,
      parentId: comment.parentId,
      content: comment.content,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    // Các bình luận con bị xóa theo nhờ ON DELETE CASCADE của cột parent_id.
    await this.repository.delete({ id });
  }

  private toDomain(entity: LessonCommentOrmEntity): LessonComment {
    return new LessonComment(
      entity.id,
      entity.lessonId,
      entity.userId,
      entity.parentId,
      entity.content,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
