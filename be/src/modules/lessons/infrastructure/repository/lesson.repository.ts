import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';

import { Lesson } from '@/modules/lessons/domain/entity/lesson.entity';
import { ILessonRepository } from '@/modules/lessons/domain/repository/lesson.repository';

@Injectable()
export class LessonRepository implements ILessonRepository {
  constructor(
    @InjectRepository(LessonOrmEntity)
    private readonly repository: Repository<LessonOrmEntity>,
  ) {}

  async findById(id: number): Promise<Lesson | null> {
    const entity = await this.repository.findOne({
      where: {
        id: id.toString(),
      },
    });

    if (!entity) {
      return null;
    }

    return this.toDomain(entity);
  }

  async findBySlug(sectionId: number, slug: string): Promise<Lesson | null> {
    const entity = await this.repository.findOne({
      where: {
        sectionId: sectionId.toString(),
        slug,
      },
    });

    if (!entity) {
      return null;
    }

    return this.toDomain(entity);
  }

  async create(lesson: Lesson): Promise<Lesson> {
    const entity = this.repository.create({
      sectionId: lesson.sectionId.toString(),
      title: lesson.title,
      slug: lesson.slug,
      type: lesson.type,
      videoProvider: lesson.videoProvider,
      videoSource: lesson.videoSource,
      duration: lesson.duration,
      content: lesson.content,
      position: lesson.position,
      publishedAt: lesson.publishedAt,
      status: lesson.status,
      isPreview: lesson.isPreview,
    });

    const saved = await this.repository.save(entity);

    return this.toDomain(saved);
  }

  async update(lesson: Lesson): Promise<Lesson> {
    const entity = await this.repository.preload({
      id: lesson.id!.toString(),
      sectionId: lesson.sectionId.toString(),
      title: lesson.title,
      slug: lesson.slug,
      type: lesson.type,
      videoProvider: lesson.videoProvider,
      videoSource: lesson.videoSource,
      duration: lesson.duration,
      content: lesson.content,
      position: lesson.position,
      publishedAt: lesson.publishedAt,
      status: lesson.status,
      isPreview: lesson.isPreview,
    });

    if (!entity) {
      throw new Error('Lesson not found');
    }

    const saved = await this.repository.save(entity);

    return this.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  private toDomain(entity: LessonOrmEntity): Lesson {
    return Lesson.restore({
      id: Number(entity.id),
      sectionId: Number(entity.sectionId),
      title: entity.title,
      slug: entity.slug,
      type: entity.type,
      videoProvider: entity.videoProvider,
      videoSource: entity.videoSource,
      duration: entity.duration,
      content: entity.content,
      position: entity.position,
      publishedAt: entity.publishedAt,
      status: entity.status,
      isPreview: entity.isPreview,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}
