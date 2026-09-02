import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SectionOrmEntity } from '../entity/section.orm-entity';

import { Section } from '../../domain/entity/section.entity';
import { ISectionRepository } from '../../domain/repository/section.repository';

@Injectable()
export class SectionRepository implements ISectionRepository {
  constructor(
    @InjectRepository(SectionOrmEntity)
    private readonly repository: Repository<SectionOrmEntity>,
  ) {}

  async findById(id: number): Promise<Section | null> {
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

  async findBySlug(courseId: number, slug: string): Promise<Section | null> {
    const entity = await this.repository.findOne({
      where: {
        courseId: courseId.toString(),
        slug,
      },
    });

    if (!entity) {
      return null;
    }

    return this.toDomain(entity);
  }

  async create(section: Section): Promise<Section> {
    const entity = this.repository.create({
      courseId: section.courseId.toString(),
      title: section.title,
      slug: section.slug,
      description: section.description,
      position: section.position,
      isActive: section.isActive,
    });

    const saved = await this.repository.save(entity);

    return this.toDomain(saved);
  }

  async update(section: Section): Promise<Section> {
    const entity = await this.repository.preload({
      id: section.id!.toString(),
      courseId: section.courseId.toString(),
      title: section.title,
      slug: section.slug,
      description: section.description,
      position: section.position,
      isActive: section.isActive,
    });

    if (!entity) {
      throw new Error('Section not found');
    }

    const saved = await this.repository.save(entity);

    return this.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  private toDomain(entity: SectionOrmEntity): Section {
    return Section.restore({
      id: Number(entity.id),
      courseId: Number(entity.courseId),
      title: entity.title,
      slug: entity.slug,
      description: entity.description,
      position: entity.position,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}
