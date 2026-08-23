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