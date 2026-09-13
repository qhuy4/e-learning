import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/features/categories/services/category.service";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (page: number, limit: number, search?: string, parentId?: number | null, getAll?: boolean) =>
    [...categoryKeys.lists(), { page, limit, search, parentId, getAll }] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useCategories(
  page: number,
  limit: number,
  search?: string,
  parentId?: number | null,
  getAll?: boolean,
) {
  return useQuery({
    queryKey: categoryKeys.list(page, limit, search, parentId, getAll),
    queryFn: () => categoryService.list({ page, limit, keyword: search, parentId, getAll }),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof categoryService.create>[0]) => categoryService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof categoryService.update>[1] }) =>
      categoryService.update(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
