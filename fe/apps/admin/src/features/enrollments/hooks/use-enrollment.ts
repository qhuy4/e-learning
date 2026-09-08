import { useQuery } from "@tanstack/react-query";
import { enrollmentService } from "@/features/enrollments/services/enrollment.service";

export const enrollmentKeys = {
  all: ["enrollments"] as const,
  lists: () => [...enrollmentKeys.all, "list"] as const,
  list: (page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string, status?: number) =>
    [...enrollmentKeys.lists(), { page, limit, search, sortBy, sortOrder, status }] as const,
  details: () => [...enrollmentKeys.all, "detail"] as const,
  detail: (id: string) => [...enrollmentKeys.details(), id] as const,
};

export function useEnrollments(
  page: number,
  limit: number,
  search?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  status?: number,
) {
  return useQuery({
    queryKey: enrollmentKeys.list(page, limit, search, sortBy, sortOrder, status),
    queryFn: () => enrollmentService.list({ page, limit, keyword: search, sortBy, sortOrder, status }),
  });
}

export function useEnrollment(id: string) {
  return useQuery({
    queryKey: enrollmentKeys.detail(id),
    queryFn: () => enrollmentService.getById(id),
    enabled: !!id,
  });
}
