import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quizService } from "../services/quiz.service";

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quizService.createQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-quizzes"] });
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => quizService.updateQuiz(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.id] });
    },
  });
};

export const useGetQuizById = (id?: number) => {
  return useQuery({
    queryKey: ["quiz", id],
    queryFn: () => quizService.getQuizById(id!),
    enabled: !!id,
  });
};

export const useAttachQuizToLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, lessonId }: { quizId: number; lessonId: number | string }) => quizService.attachToLesson(quizId, lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lesson-quizzes", variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ["course-detail"] });
    },
  });
};

export const useGetLessonQuizzes = (lessonId?: number) => {
  return useQuery({
    queryKey: ["lesson-quizzes", lessonId],
    queryFn: () => quizService.getLessonQuizzes(lessonId!),
    enabled: !!lessonId,
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quizService.deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["my-quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["course-detail"] });
    },
  });
};

export const useDetachQuizFromLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, lessonId }: { quizId: number; lessonId: number }) => 
      quizService.detachFromLesson(quizId, lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lesson-quizzes", variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ["course-detail"] });
    },
  });
};
