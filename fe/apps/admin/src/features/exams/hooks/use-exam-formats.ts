import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examFormatService } from "../services/exam-format.service";
import type { CreateExamFormatDto, UpdateExamFormatDto, CreateExamFormatSectionDto } from "../types/exam";

export const examFormatKeys = {
  all: ["exam-formats"] as const,
  lists: () => [...examFormatKeys.all, "list"] as const,
  deleted: () => [...examFormatKeys.all, "deleted"] as const,
  details: () => [...examFormatKeys.all, "detail"] as const,
  detail: (id: number) => [...examFormatKeys.details(), id] as const,
  sections: (formatId: number) => [...examFormatKeys.detail(formatId), "sections"] as const,
};

export function useExamFormats() {
  return useQuery({
    queryKey: examFormatKeys.lists(),
    queryFn: () => examFormatService.list(),
  });
}

export function useDeletedExamFormats() {
  return useQuery({
    queryKey: examFormatKeys.deleted(),
    queryFn: () => examFormatService.listDeleted(),
  });
}

export function useExamFormat(id: number) {
  return useQuery({
    queryKey: examFormatKeys.detail(id),
    queryFn: () => examFormatService.getById(id),
    enabled: !!id,
  });
}

export function useCreateExamFormat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamFormatDto) => examFormatService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examFormatKeys.lists() });
    },
  });
}

export function useUpdateExamFormat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamFormatDto }) =>
      examFormatService.update(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examFormatKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: examFormatKeys.detail(variables.id) });
    },
  });
}

export function useDeleteExamFormat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examFormatService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examFormatKeys.all });
      // Đề thi ẩn/hiện theo định dạng → làm mới danh sách đề.
      void queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}

export function useRestoreExamFormat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examFormatService.restore(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examFormatKeys.all });
      // Đề thi ẩn/hiện theo định dạng → làm mới danh sách đề.
      void queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}

export function useExamFormatSections(formatId: number) {
  return useQuery({
    queryKey: examFormatKeys.sections(formatId),
    queryFn: () => examFormatService.getSections(formatId),
    enabled: !!formatId,
  });
}

export function useCreateExamFormatSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formatId, data }: { formatId: number; data: CreateExamFormatSectionDto }) =>
      examFormatService.createSection(formatId, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examFormatKeys.sections(variables.formatId) });
    },
  });
}

export function useUpdateExamFormatSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: number; data: Partial<CreateExamFormatSectionDto> }) =>
      examFormatService.updateSection(sectionId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examFormatKeys.all });
    },
  });
}

export function useDeleteExamFormatSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sectionId: number) => examFormatService.removeSection(sectionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examFormatKeys.all });
    },
  });
}
