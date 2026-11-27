import { useQuery } from "@tanstack/react-query";
import { studentService, type GetStudentsParams } from "@/features/students/services/student.service";

export function useStudents(params: GetStudentsParams) {
  return useQuery({
    queryKey: ["instructor-enrollments", params],
    queryFn: () => studentService.getStudents(params),
  });
}

export function useStudentDetail(enrollmentId: number) {
  return useQuery({
    queryKey: ["instructor-enrollment-detail", enrollmentId],
    queryFn: () => studentService.getStudentDetail(enrollmentId),
    enabled: !!enrollmentId,
  });
}

export function useStudentProgress(enrollmentId: number) {
  return useQuery({
    queryKey: ["instructor-enrollment-progress", enrollmentId],
    queryFn: () => studentService.getStudentProgress(enrollmentId),
    enabled: !!enrollmentId,
  });
}

export function useStudentQuizAttempts(enrollmentId: number) {
  return useQuery({ queryKey: ["instructor-enrollment-quiz-attempts", enrollmentId], queryFn: () => studentService.getQuizAttempts(enrollmentId), enabled: !!enrollmentId });
}

export function useStudentQuizAttemptDetail(enrollmentId: number, attemptId: string | null) {
  return useQuery({ queryKey: ["instructor-quiz-attempt-detail", enrollmentId, attemptId], queryFn: () => studentService.getQuizAttemptDetail(enrollmentId, attemptId!), enabled: !!enrollmentId && !!attemptId });
}
