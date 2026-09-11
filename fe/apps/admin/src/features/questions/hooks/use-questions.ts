import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { questionService } from "@/features/questions/services/question.service";

export const questionKeys = {
  all: ["questions"] as const,
  lists: () => [...questionKeys.all, "list"] as const,
  list: (page: number, limit: number, courseId?: number, status?: number, keyword?: string, sortBy?: string, sortOrder?: string) =>
    [...questionKeys.lists(), { page, limit, courseId, status, keyword, sortBy, sortOrder }] as const,
  details: () => [...questionKeys.all, "detail"] as const,
  detail: (id: string) => [...questionKeys.details(), id] as const,
};

export function useQuestions(
  page: number,
  limit: number,
  courseId?: number,
  status?: number,
  keyword?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) {
  return useQuery({
    queryKey: questionKeys.list(page, limit, courseId, status, keyword, sortBy, sortOrder),
    queryFn: () => questionService.list({ page, limit, courseId, status, keyword, sortBy, sortOrder }),
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: questionKeys.detail(id),
    queryFn: () => questionService.getById(id),
    enabled: !!id,
  });
}

export function useUpdateQuestionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      questionService.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: questionKeys.detail(variables.id) });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
  });
}

export function useUpdateAnswerStatus(questionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      questionService.updateAnswerStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
    },
  });
}

export function useDeleteAnswer(questionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionService.removeAnswer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
    },
  });
}
