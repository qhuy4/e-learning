import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminCourseService } from '../services/admin-course.service';

export const useApproveCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminCourseService.approveCourse,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", String(id)] });
    },
  });
};

export const useRejectCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminCourseService.rejectCourse,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", String(variables.id)] });
    },
  });
};


export const useGetCourses = (params?: { page?: number; limit?: number; level?: string; keyword?: string; status?: string }) => {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: () => adminCourseService.getCourses(params),
  });
};