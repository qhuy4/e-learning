import { Section } from '@/modules/sections/domain/entity/section.entity';
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
    public status: number,
    public reviewedBy: number | null,
    public reviewedAt: Date | null,
    public publishedAt: Date | null,
    public rejectReason: string | null,
    public parentId: number | null,
    public version: number,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public deletedAt: Date | null,
    public sections?: Section[] | null, // 💡 Thêm thuộc tính chứa danh sách Sections
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
      1,
      null,
      null,
      null,
      [], // Trống khi mới khởi tạo
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
    sections?: Section[] | null; // 💡 Nhận mảng sections khi khôi phục từ DB
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

    this.version += 1;
    this.updatedAt = new Date();
  }
}
