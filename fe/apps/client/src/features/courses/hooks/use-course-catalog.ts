import { useQuery } from "@tanstack/react-query";
import { courseCatalogService, type CatalogParams } from "../services/course-catalog.service";

export const useCatalogCourses = (params: CatalogParams) => {
  return useQuery({
    queryKey: ["catalog-courses", params],
    queryFn: () => courseCatalogService.getCatalog(params),
  });
};

export interface CatalogStats {
  total: number;
  beginner: number;
  intermediate: number;
  advanced: number;
}

export const useCatalogStats = () => {
  return useQuery({
    queryKey: ["catalog-stats"],
    queryFn: async (): Promise<CatalogStats> => {
      const [all, beginner, intermediate, advanced] = await Promise.all([
        courseCatalogService.getCatalog({ page: 1, limit: 1 }),
        courseCatalogService.getCatalog({ page: 1, limit: 1, levels: [1] }),
        courseCatalogService.getCatalog({ page: 1, limit: 1, levels: [2] }),
        courseCatalogService.getCatalog({ page: 1, limit: 1, levels: [3] }),
      ]);
      return {
        total: all.meta.total,
        beginner: beginner.meta.total,
        intermediate: intermediate.meta.total,
        advanced: advanced.meta.total,
      };
    },
  });
};
