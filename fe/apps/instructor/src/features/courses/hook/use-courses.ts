import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseService } from "../services/course.service";

export function useGetCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => courseService.getCategories(),
  });
}

export function useGetCourses(params: {
  page?: number;
  limit?: number;
  level?: number;
  keyword?: string;
  status?: number;
}) {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: () => courseService.getCourses(params),
  });
}

export function useGetCourseDetail(courseId: string | undefined) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => courseService.getCourseById(courseId!),
    enabled: !!courseId,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => courseService.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      courseService.updateCourse(id, data),
    onSuccess: (_data, variables) => {
      queryClient.removeQueries({ queryKey: ["course", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useCloneCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseService.cloneCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      section,
    }: {
      courseId: number;
      section: { title: string; position?: number; description?: string };
    }) => courseService.createSection(courseId, section),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["course", String(variables.courseId)],
      });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      sectionId,
      data,
    }: {
      courseId: number;
      sectionId: number;
      data: { title?: string; position?: number };
    }) => courseService.updateSection(courseId, sectionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["course", String(variables.courseId)],
      });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      sectionId,
    }: {
      courseId: number;
      sectionId: number;
    }) => courseService.deleteSection(courseId, sectionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["course", String(variables.courseId)],
      });
    },
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      data,
    }: {
      sectionId: number;
      data: FormData;
    }) => courseService.createLesson(sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useUpdateLesson() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: FormData;
    }) => courseService.updateLesson(id, data),
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => courseService.deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useCancelReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseService.cancelReview(id),
    onSuccess: (_data, variables) => {
      queryClient.removeQueries({ queryKey: ["course", variables] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
