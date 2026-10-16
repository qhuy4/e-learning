import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';

import { Lesson } from '@/modules/lessons/domain/entity/lesson.entity';
import { ILessonRepository } from '@/modules/lessons/domain/repository/lesson.repository';
import { LessonMapper } from '@/modules/lessons/infrastructure/mapper/lesson.mapper';

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

    return LessonMapper.toDomain(entity);
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

    return LessonMapper.toDomain(entity);
  }

  async findGlobalBySlug(
    slug: string,
    courseSlug?: string,
  ): Promise<Lesson | null> {
    const qb = this.repository
      .createQueryBuilder('lesson')
      .where('lesson.slug = :slug', { slug })
      .andWhere('lesson.deleted_at IS NULL');

    if (courseSlug) {
      // Trùng slug giữa version/course → resolve đúng lesson của courseSlug đang mở
      qb.innerJoin('sections', 'section', 'section.id = lesson.section_id')
        .innerJoin('courses', 'course', 'course.id = section.course_id')
        .andWhere('course.slug = :courseSlug', { courseSlug })
        .andWhere('course.deleted_at IS NULL')
        .andWhere('section.deleted_at IS NULL');
    }

    const entity = await qb.getOne();

    if (!entity) {
      return null;
    }

    return LessonMapper.toDomain(entity);
  }

  async create(lesson: Lesson): Promise<Lesson> {
    const entity = this.repository.create({
      sectionId: lesson.sectionId.toString(),
      title: lesson.title,
      slug: lesson.slug,
      type: lesson.type,
      videoProvider: lesson.videoProvider,
      videoSource: lesson.videoSource,
      thumbnail: lesson.thumbnail,
      duration: lesson.duration,
      content: lesson.content,
      position: lesson.position,
      publishedAt: lesson.publishedAt,
      status: lesson.status,
      isPreview: lesson.isPreview,
    });

    const saved = await this.repository.save(entity);

    // lessons.id do DB tự sinh (BIGSERIAL nextval) — entity dùng @PrimaryColumn
    // (không phải @PrimaryGeneratedColumn) nên TypeORM không populate id sau
    // INSERT → đọc lại bản ghi để trả về id thật (tránh id=NaN → null trong JSON)
    const persisted = await this.repository.findOne({
      where: { slug: saved.slug, sectionId: saved.sectionId },
    });

    return LessonMapper.toDomain(persisted ?? saved);
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
      thumbnail: lesson.thumbnail,
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

    return LessonMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findBySectionId(sectionId: number): Promise<Lesson[]> {
    const entities = await this.repository.find({
      where: {
        sectionId: sectionId.toString(),
      },
      order: {
        position: 'ASC',
      },
    });

    return entities.map((entity) => LessonMapper.toDomain(entity));
  }
}
