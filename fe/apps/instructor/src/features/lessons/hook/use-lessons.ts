import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lessonService } from "../services/lesson.service";
import type { Lesson } from "../types/lesson.types";

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: number; data: Lesson }) => {
      return lessonService.createLesson(sectionId, data);
    },
    onSuccess: (_data, variables) => {
      const courseId = (variables.data as any).courseId;
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ["course", String(courseId)] });
      }
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useGetLesson = (id: number) => {
  return useQuery({
    queryKey: ["lesson", id],
    queryFn: () => lessonService.getLessonById(id),
    enabled: !!id,
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Lesson> }) => {
      return lessonService.updateLesson(id, data);
    },
    onSuccess: (_data, variables) => {
      const courseId = (variables.data as any)?.courseId;
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ["course", String(courseId)] });
      }
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      return lessonService.deleteLesson(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};
