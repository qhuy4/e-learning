import type { AdminCategory, AdminCategoryDetail } from "@/features/categories/types/category";
import { adminApi } from "@/shared/lib/axios.ts";

export const categoryService = {
  async list(params: {
    page?: number;
    limit?: number;
    keyword?: string;
    parentId?: number | null;
    getAll?: boolean;
  }): Promise<{ data: AdminCategory[]; meta: any }> {
    const response = await adminApi.get("/categories", { params });
    return response.data;
  },

  async getById(id: string): Promise<AdminCategoryDetail> {
    const response = await adminApi.get(`/categories/${id}`);
    return response.data.data;
  },

  async create(data: {
    name: string;
    slug: string;
    parentId?: number | null;
  }): Promise<AdminCategoryDetail> {
    const response = await adminApi.post("/categories", data);
    return response.data.data;
  },

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      parentId?: number | null;
    },
  ): Promise<AdminCategoryDetail> {
    const response = await adminApi.patch(`/categories/${id}`, data);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await adminApi.delete(`/categories/${id}`);
  },
};
