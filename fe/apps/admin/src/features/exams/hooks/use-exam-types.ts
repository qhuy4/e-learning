import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examTypeService } from "../services/exam-type.service";
import type { CreateExamTypeDto, UpdateExamTypeDto } from "../types/exam";

export const examTypeKeys = {
  all: ["exam-types"] as const,
  lists: () => [...examTypeKeys.all, "list"] as const,
  deleted: () => [...examTypeKeys.all, "deleted"] as const,
  details: () => [...examTypeKeys.all, "detail"] as const,
  detail: (id: number) => [...examTypeKeys.details(), id] as const,
};

export function useExamTypes() {
  return useQuery({
    queryKey: examTypeKeys.lists(),
    queryFn: () => examTypeService.list(),
  });
}

/** Danh sách loại đề đã xóa mềm (trang "Đã xóa"). */
export function useDeletedExamTypes() {
  return useQuery({
    queryKey: examTypeKeys.deleted(),
    queryFn: () => examTypeService.listDeleted(),
  });
}

/** Khôi phục loại đề — các đề chưa bị xóa riêng hiển thị lại ngay. */
export function useRestoreExamType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examTypeService.restore(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examTypeKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: examTypeKeys.deleted() });
      // Loại đề active → danh sách đề thi hiển thị lại các đề thuộc loại này.
      void queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}

export function useExamType(id: number) {
  return useQuery({
    queryKey: examTypeKeys.detail(id),
    queryFn: () => examTypeService.getById(id),
    enabled: !!id,
  });
}

export function useCreateExamType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamTypeDto) => examTypeService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examTypeKeys.lists() });
    },
  });
}

export function useUpdateExamType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamTypeDto }) =>
      examTypeService.update(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examTypeKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: examTypeKeys.detail(variables.id) });
    },
  });
}

export function useDeleteExamType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examTypeService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examTypeKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: examTypeKeys.deleted() });
      // Xóa loại đề → các đề thuộc loại đó bị ẩn khỏi danh sách active.
      void queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}
