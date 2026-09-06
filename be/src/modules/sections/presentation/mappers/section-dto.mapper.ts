import { Section } from '../../domain/entity/section.entity';
import { LessonDtoMapper } from '@/modules/lessons/presentation/mappers/lesson-dto.mapper';

export class SectionDtoMapper {
  static toDto(section: Section) {
    return {
      id: String(section.id),
      title: section.title,
      slug: section.slug,
      description: section.description,
      position: section.position,
      lessons: LessonDtoMapper.toDtoList(section.lessons ?? []),
    };
  }

  static toDtoList(sections: Section[] = []) {
    return sections.map((section) => SectionDtoMapper.toDto(section));
  }
}
