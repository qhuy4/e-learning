import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teachingProfileService } from "../services/teaching-profile.service";
import type { UpdateTeachingProfileRequest } from "../types/teaching-profile.types";

export function useTeachingProfile() {
  return useQuery({
    queryKey: ["teaching-profile"],
    queryFn: teachingProfileService.get,
  });
}

export function useUpdateTeachingProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTeachingProfileRequest) =>
      teachingProfileService.update(data),
    onSuccess: (data) => {
      qc.setQueryData(["teaching-profile"], data);
    },
  });
}
