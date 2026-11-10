import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import { quizService } from '../services/quiz.service';
import type { SubmitQuizAnswer } from '../types/quiz.type';

export const useLessonQuizzes = (lessonId?: number, enabled = true) => {
  return useQuery({
    queryKey: ['lesson-quizzes', lessonId],
    queryFn: () => quizService.getLessonQuizzes(lessonId!),
    enabled: enabled && !!lessonId,
  });
};

/** Quiz theo từng bài để hiển thị tiến độ/điểm ngay trên sidebar lộ trình. */
export const useCourseLessonQuizzes = (lessonIds: number[], enabled = true) => {
  const results = useQueries({
    queries: lessonIds.map((lessonId) => ({
      queryKey: ['lesson-quizzes', lessonId],
      queryFn: () => quizService.getLessonQuizzes(lessonId),
      enabled: enabled && lessonId > 0,
      staleTime: 30_000,
    })),
  });

  return new Map(
    lessonIds.map((lessonId, index) => [lessonId, results[index]?.data ?? []]),
  );
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

export const useQuizAttemptHistory = (quizId?: number, enabled = true) =>
  useQuery({
    queryKey: ['quiz-attempt-history', quizId],
    queryFn: () => quizService.getAttemptHistory(quizId!),
    enabled: enabled && !!quizId,
  });

export const useQuizAttemptReview = (attemptId?: string | number, enabled = true) =>
  useQuery({
    queryKey: ['quiz-attempt-review', attemptId],
    queryFn: () => quizService.getAttemptReview(attemptId!),
    enabled: enabled && !!attemptId,
  });
