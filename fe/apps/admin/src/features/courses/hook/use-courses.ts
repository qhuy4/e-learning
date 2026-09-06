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
      queryClient.invalidateQueries({
        queryKey: ["my-courses"],
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

export const useGetMyCourses = (params?: { page?: number; limit?: number; level?: string; keyword?: string; status?: string }) => {
  return useQuery({
    queryKey: ["my-courses", params],
    queryFn: () => courseService.getMyCourses(params),
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
      queryClient.invalidateQueries({
        queryKey: ["my-courses"],
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

export const useCloneCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.cloneCourse,
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ["my-courses"],
      });
      await queryClient.refetchQueries({
        queryKey: ["courses"],
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tạo bản sao khóa học';
      throw new Error(message);
    },
  });
};


export const useCancelReviewCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => courseService.cancelReview(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["course", String(id)],
      });
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-courses"],
      });
    },
  });
};