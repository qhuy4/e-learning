import { api } from "@fe/lib/axios";
import type { CatalogCourse } from "../components/Catalog/types";

export interface CatalogMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CatalogResponse {
  data: CatalogCourse[];
  meta: CatalogMeta;
}

export interface CatalogParams {
  page?: number;
  limit?: number;
  keyword?: string;
  levels?: number[];
  price?: "all" | "free" | "paid";
  minRating?: number;
  sort?: string;
}

export const courseCatalogService = {
  getCatalog: async (params: CatalogParams = {}): Promise<CatalogResponse> => {
    const query: Record<string, string | number> = {};
    if (params.page) query.page = params.page;
    if (params.limit) query.limit = params.limit;
    if (params.keyword) query.keyword = params.keyword;
    if (params.levels && params.levels.length > 0) query.levels = params.levels.join(",");
    if (params.price && params.price !== "all") query.price = params.price;
    if (params.minRating) query.minRating = params.minRating;
    if (params.sort) query.sort = params.sort;

    const { data: res } = await api.get("/courses/catalog", { params: query });
    return { data: res.data, meta: res.meta } as CatalogResponse;
  },
};
