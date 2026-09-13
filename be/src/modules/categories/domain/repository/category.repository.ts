export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY';

export interface ICategoryRepository {
  findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    parentId?: number | null;
    getAll?: boolean;
  }): Promise<{ data: any[]; meta: { page: number; limit: number; total: number; totalPages: number } }>;
  findById(id: number): Promise<any | null>;
  findBySlug(slug: string): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: number, data: any): Promise<any>;
  delete(id: number): Promise<void>;
}
