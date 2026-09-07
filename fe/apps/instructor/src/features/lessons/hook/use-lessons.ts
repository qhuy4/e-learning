import { useMutation, useQuery } from "@tanstack/react-query";
import { lessonService } from "../services/lesson.service";
import type { Lesson } from "../types/lesson.types";

export const useCreateLesson = () => {
  return useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: number; data: Lesson }) => {
      return lessonService.createLesson(sectionId, data);
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
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Lesson> }) => {
      return lessonService.updateLesson(id, data);
    },
  });
};

export const useDeleteLesson = () => {
  return useMutation({
    mutationFn: (id: number) => {
      return lessonService.deleteLesson(id);
    },
  });
};
