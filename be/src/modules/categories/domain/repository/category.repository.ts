export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY';

/**
 * Category con trong cây danh mục — mapper chỉ nạp các trường con,
 * `courseCount` gắn thêm khi list được đếm.
 */
export interface CategoryChild {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  courseCount?: number;
}

/** Category trả về từ repository (domain object từ CategoryMapper). */
export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  children?: CategoryChild[];
  courseCount: number;
}

export interface AdminCategoriesPage {
  data: CategoryItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ICategoryRepository {
  findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    parentId?: number | null;
    getAll?: boolean;
  }): Promise<AdminCategoriesPage>;
  findById(id: number): Promise<CategoryItem | null>;
  findBySlug(slug: string): Promise<CategoryItem | null>;
  create(data: any): Promise<CategoryItem | null>;
  update(id: number, data: any): Promise<CategoryItem | null>;
  delete(id: number): Promise<void>;
}
