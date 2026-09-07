import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SectionOrmEntity } from '@/modules/sections/infrastructure/entity/section.orm-entity';

import { Section } from '@/modules/sections/domain/entity/section.entity';
import { ISectionRepository } from '@/modules/sections/domain/repository/section.repository';
import { SectionMapper } from '@/modules/sections/infrastructure/mapper/section.mapper';

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

    return SectionMapper.toDomain(entity);
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

    return SectionMapper.toDomain(entity);
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

    return SectionMapper.toDomain(saved);
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

    return SectionMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findByCourseId(courseId: number): Promise<Section[]> {
    const entities = await this.repository.find({
      where: {
        courseId: courseId.toString(),
      },
      order: {
        position: 'ASC',
      },
    });

    return entities.map((entity) => SectionMapper.toDomain(entity));
  }
}
