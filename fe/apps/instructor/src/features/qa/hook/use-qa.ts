import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qaService, type GetQuestionsParams } from "@/features/qa/services/qa.service";

export function useInstructorQuestions(params: GetQuestionsParams) {
  return useQuery({
    queryKey: ["instructor-questions", params],
    queryFn: () => qaService.getInstructorQuestions(params),
  });
}

export function useQuestionDetail(id: number) {
  return useQuery({
    queryKey: ["instructor-question-detail", id],
    queryFn: () => qaService.getQuestionDetail(id),
    enabled: !!id,
  });
}

export function useCreateAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, content }: { questionId: number; content: string }) =>
      qaService.createAnswer(questionId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["instructor-questions"] });
      queryClient.invalidateQueries({ queryKey: ["instructor-question-detail", variables.questionId] });
    },
  });
}

export function useUpdateQuestionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      qaService.updateQuestionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-questions"] });
    },
  });
}
