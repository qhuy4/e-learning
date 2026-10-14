import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "../services/exam.service";
import type { SubmitExamAttemptDto } from "../types/exam";

export const examKeys = {
  all: ["exams"] as const,
  published: () => [...examKeys.all, "published"] as const,
  detail: (id: number) => [...examKeys.all, "detail", id] as const,
  attempts: (examId: number) => [...examKeys.all, "attempts", examId] as const,
  answers: (attemptId: number) => [...examKeys.all, "answers", attemptId] as const,
};

export function usePublishedExams() {
  return useQuery({
    queryKey: examKeys.published(),
    queryFn: () => examService.listPublished(),
  });
}

export function useExamDetail(id: number) {
  return useQuery({
    queryKey: examKeys.detail(id),
    queryFn: () => examService.getDetail(id),
    enabled: !!id,
  });
}

export function useStartExam() {
  return useMutation({
    mutationFn: (examId: number) => examService.start(examId),
  });
}

export function useSubmitExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, data }: { attemptId: number; data: SubmitExamAttemptDto }) =>
      examService.submit(attemptId, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examKeys.answers(variables.attemptId) });
    },
  });
}

export function useExamAnswers(attemptId: number) {
  return useQuery({
    queryKey: examKeys.answers(attemptId),
    queryFn: () => examService.getAnswers(attemptId),
    enabled: !!attemptId,
  });
}

export function useExamAttempts(examId: number) {
  return useQuery({
    queryKey: examKeys.attempts(examId),
    queryFn: () => examService.getAttempts(examId),
    enabled: !!examId,
  });
}
