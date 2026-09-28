import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherService } from "../services/teacher.service";
import type { RegisterTeacherRequest } from "../types/teacher.types";

export function useTeacherStatus() {
  return useQuery({
    queryKey: ["teacher-status"],
    queryFn: () => teacherService.getMyStatus(),
    retry: false,
  });
}

export function useRegisterTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, files }: {
      data: RegisterTeacherRequest;
      files: {
        identity_front: File;
        identity_back: File;
        selfie_with_id: File;
        certificate_files?: File[];
      };
    }) => teacherService.register(data, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-status"] });
    },
  });
}
