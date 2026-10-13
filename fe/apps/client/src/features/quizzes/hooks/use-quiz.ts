import { useMutation, useQuery } from '@tanstack/react-query';
import { quizService } from '../services/quiz.service';
import type { SubmitQuizAnswer } from '../types/quiz.type';

export const useLessonQuizzes = (lessonId?: number, enabled = true) => {
  return useQuery({
    queryKey: ['lesson-quizzes', lessonId],
    queryFn: () => quizService.getLessonQuizzes(lessonId!),
    enabled: enabled && !!lessonId,
  });
};

export const useStartQuiz = () => {
  return useMutation({
    mutationFn: (quizId: number) => quizService.startQuiz(quizId),
  });
};

export const useSubmitQuiz = () => {
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string; answers: SubmitQuizAnswer[] }) =>
      quizService.submitQuiz(attemptId, answers),
  });
};
