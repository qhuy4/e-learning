import { useQuery } from '@tanstack/react-query';
import { courseService } from '../services/course.service';
import type { GetCoursesParams } from '../types/course.type';

export const useCourses = (params?: GetCoursesParams) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => courseService.getCourses(params),
  });
};

export const useCourseBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['course', slug],
    queryFn: () => courseService.getCourseBySlug(slug),
    enabled: !!slug,
  });
};

export const useCourseById = (id: string | number) => {
  return useQuery({
    queryKey: ['course', 'id', id],
    queryFn: () => courseService.getCourseById(id),
    enabled: !!id,
  });
};

export const usePreviewCourse = (token: string) => {
  return useQuery({
    queryKey: ['course', 'preview', token],
    queryFn: () => courseService.previewCourse(token),
    enabled: !!token,
  });
};

export const useRelatedCourses = (slug: string) => {
  return useQuery({
    queryKey: ['courses', 'related', slug],
    queryFn: () => courseService.getRelatedCourses(slug),
    enabled: !!slug,
  });
};