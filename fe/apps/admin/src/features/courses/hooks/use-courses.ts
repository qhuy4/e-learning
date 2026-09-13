import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../services/course.service';
import type { Course } from '../types/course.types';

export const courseKeys = {
  all: ["courses"] as const,
  detail: (id: string | number) => ["course", String(id)] as const,
};

export const useCreateCourse = () => {
  return useMutation({
    mutationFn: (data: Course) => courseService.createCourse(data),
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Course> }) => courseService.updateCourse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
};

export const useGetCourseDetail = (courseId?: string | number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: courseKeys.detail(courseId ?? ""),
    queryFn: () => courseService.getCourseById(courseId!),
    enabled: Boolean(courseId) && (options?.enabled ?? true),
  });
};

export const useCancelReviewCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => courseService.cancelReview(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseService.createSection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseService.updateSection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseService.deleteSection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
};
