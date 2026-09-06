import { Section } from '@/modules/sections/domain/entity/section.entity';
import { CourseStatus } from '../enum/course-status.enum';
export class Course {
  private constructor(
    public id: number | null,
    public instructorId: number,
    public title: string,
    public slug: string,
    public description: string | null,
    public thumbnail: string | null,
    public level: number,
    public price: number,
    public status: CourseStatus,
    public reviewedBy: number | null,
    public reviewedAt: Date | null,
    public publishedAt: Date | null,
    public rejectReason: string | null,
    public parentId: number | null,
    public version: number,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public deletedAt: Date | null,
    public sections?: Section[] | null,
  ) {}

  static create(params: {
    instructorId: number;
    title: string;
    slug: string;
    description?: string | null;
    thumbnail?: string | null;
    level?: number;
    price?: number;
    status?: number;
    parentId?: number | null;
    version?: number | null;
  }): Course {
    return new Course(
      null,
      params.instructorId,
      params.title,
      params.slug,
      params.description ?? null,
      params.thumbnail ?? null,
      params.level ?? 1,
      params.price ?? 0,
      params.status ?? 1,
      null,
      null,
      null,
      null,
      params.parentId ?? null,
      params.version ?? 1,
      new Date(),
      null,
      null,
      [],
    );
  }

  static restore(params: {
    id: number;
    instructorId: number;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    level: number;
    price: number;
    status: number;
    reviewedBy: number | null;
    reviewedAt: Date | null;
    publishedAt: Date | null;
    rejectReason: string | null;
    parentId: number | null;
    version: number;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    sections?: Section[] | null;
  }): Course {
    return new Course(
      params.id,
      params.instructorId,
      params.title,
      params.slug,
      params.description,
      params.thumbnail,
      params.level,
      params.price,
      params.status,
      params.reviewedBy,
      params.reviewedAt,
      params.publishedAt,
      params.rejectReason,
      params.parentId,
      params.version,
      params.createdAt,
      params.updatedAt,
      params.deletedAt,
      params.sections ?? [],
    );
  }

  update(params: {
    title?: string;
    slug?: string;
    description?: string | null;
    thumbnail?: string | null;
    level?: number;
    price?: number;
    status?: number;
    parentId?: number | null;
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

    if (params.thumbnail !== undefined) {
      this.thumbnail = params.thumbnail;
    }

    if (params.level !== undefined) {
      this.level = params.level;
    }

    if (params.price !== undefined) {
      this.price = params.price;
    }

    if (params.status !== undefined) {
      this.status = params.status;
    }

    if (params.parentId !== undefined) {
      this.parentId = params.parentId;
    }

    this.updatedAt = new Date();
  }
  clone(data: {
    title: string;
    description: string | null;
    thumbnail: string | null;
    level: number;
    price: number;
    status: CourseStatus;
    parentId: number;
    version: number;
    slug: string;
  }): Course {
    return new Course(
      null,
      this.instructorId,
      data.title,
      data.slug,
      data.description,
      data.thumbnail,
      data.level,
      data.price,
      data.status,
      null,
      null,
      new Date(),
      null,
      data.parentId,
      data.version,
      new Date(),
      null,
      null,
      [],
    );
  }
}
