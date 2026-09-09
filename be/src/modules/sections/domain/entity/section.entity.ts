import { Lesson } from '@/modules/lessons/domain/entity/lesson.entity';

export class Section {
  private constructor(
    public id: number | null,
    public courseId: number,
    public title: string,
    public slug: string,
    public description: string | null,
    public position: number,
    public isActive: boolean,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public deletedAt: Date | null,
    public lessons?: Lesson[] | null,
  ) {}

  static create(params: {
    courseId: number;
    title: string;
    slug: string;
    description?: string | null;
    position?: number;
    isActive?: boolean;
  }): Section {
    return new Section(
      null,
      params.courseId,
      params.title,
      params.slug,
      params.description ?? null,
      params.position ?? 0,
      params.isActive ?? true,
      null,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    courseId: number;
    title: string;
    slug: string;
    description: string | null;
    position: number;
    isActive: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    lessons?: Lesson[] | null;
  }): Section {
    return new Section(
      params.id,
      params.courseId,
      params.title,
      params.slug,
      params.description,
      params.position,
      params.isActive,
      params.createdAt,
      params.updatedAt,
      params.deletedAt,
      params.lessons ?? [],
    );
  }

  update(params: {
    title?: string;
    slug?: string;
    description?: string | null;
    position?: number;
    isActive?: boolean;
  }): void {
    if (params.title !== undefined) {
      this.title = params.title;
    }

    if (params.slug !== undefined) {
      this.slug = params.slug;
    }

    if (params.description !== undefined) {
      this.description = params.description;
    }

    if (params.position !== undefined) {
      this.position = params.position;
    }

    if (params.isActive !== undefined) {
      this.isActive = params.isActive;
    }
  }
  clone(courseId: number): Section {
    return Section.create({
      courseId,
      title: this.title,
      slug: this.slug,
      description: this.description,
      position: this.position,
      isActive: this.isActive,
    });
  }
}
