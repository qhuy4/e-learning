import { useQuery } from "@tanstack/react-query";
import { courseCatalogService, type CatalogParams } from "../services/course-catalog.service";

export const useCatalogCourses = (params: CatalogParams) => {
  return useQuery({
    queryKey: ["catalog-courses", params],
    queryFn: () => courseCatalogService.getCatalog(params),
  });
};
