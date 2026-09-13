export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parentId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  children?: AdminCategoryChild[];
  courseCount?: number;
}

export interface AdminCategoryChild {
  id: string;
  name: string;
  slug: string;
  parentId: number | null;
  courseCount?: number;
}

export interface AdminCategoryDetail extends AdminCategory {
  children: AdminCategoryChild[];
}
