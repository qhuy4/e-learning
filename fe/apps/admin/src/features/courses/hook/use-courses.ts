import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { courseService } from '../services/course.service';

import type { Course } from '../types/course.types';

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
      queryClient.invalidateQueries({
        queryKey: ["course", String(variables.id)],
      });
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
    },
  });
};

export const useGetCourseDetail = (courseId?: string | number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => courseService.getCourseById(courseId!),
    enabled: Boolean(courseId) && (options?.enabled ?? true),
  });
};

export const useGetCourses = (params?: { page?: number; limit?: number; level?: string; keyword?: string; status?: string }) => {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: () => courseService.getCourses(params),
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.createSection,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["course", String(variables.courseId)],
      });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.updateSection,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["course", String(variables.courseId)],
      });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.deleteSection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["course", String(variables.courseId)],
      });
    },
  });
};