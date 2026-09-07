import { Section } from '@/modules/sections/domain/entity/section.entity';

export const SECTION_REPOSITORY = Symbol('SECTION_REPOSITORY');

export interface ISectionRepository {
  findById(id: number): Promise<Section | null>;

  findBySlug(courseId: number, slug: string): Promise<Section | null>;

  create(section: Section): Promise<Section>;

  update(section: Section): Promise<Section>;

  delete(id: number): Promise<void>;
}
