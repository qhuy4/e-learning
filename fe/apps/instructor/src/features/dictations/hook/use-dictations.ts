import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dictationService } from "../services/dictation.service";
import type { Dictation } from "../types/dictation.types";

export const useGetDictationById = (id?: number) => {
  return useQuery({
    queryKey: ["dictation", id],
    queryFn: () => dictationService.getDictationById(id!),
    enabled: !!id,
  });
};

export const useGetLessonDictations = (lessonId?: number) => {
  return useQuery({
    queryKey: ["lesson-dictations", lessonId],
    queryFn: () => dictationService.getLessonDictations(lessonId!),
    enabled: !!lessonId,
  });
};

export const useCreateDictation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, audioFile }: { data: Dictation; audioFile?: File }) =>
      dictationService.createDictation(data, audioFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-dictations"] });
    },
  });
};

export const useUpdateDictation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, audioFile }: { id: number; data: Partial<Dictation>; audioFile?: File }) =>
      dictationService.updateDictation(id, data, audioFile),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dictation", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["my-dictations"] });
    },
  });
};

export const useAttachDictationToLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dictationId, lessonId }: { dictationId: number; lessonId: number | string }) =>
      dictationService.attachToLesson(dictationId, lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lesson-dictations", variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ["course-detail"] });
    },
  });
};

export const useDetachDictationFromLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dictationId, lessonId }: { dictationId: number; lessonId: number | string }) =>
      dictationService.detachFromLesson(dictationId, lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lesson-dictations", variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ["course-detail"] });
    },
  });
};

export const useDeleteDictation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dictationService.deleteDictation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-dictations"] });
      queryClient.invalidateQueries({ queryKey: ["course-detail"] });
    },
  });
};
