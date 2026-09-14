import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instructorCertificateService } from "@/features/instructor-certificates/services/instructor-certificate.service";

export const instructorCertificateKeys = {
  all: ["instructorCertificates"] as const,
  lists: () => [...instructorCertificateKeys.all, "list"] as const,
  list: (page: number, limit: number, status?: number, keyword?: string, sortBy?: string, sortOrder?: string) =>
    [...instructorCertificateKeys.lists(), { page, limit, status, keyword, sortBy, sortOrder }] as const,
  details: () => [...instructorCertificateKeys.all, "detail"] as const,
  detail: (id: number) => [...instructorCertificateKeys.details(), id] as const,
};

export function useInstructorCertificates(
  page: number,
  limit: number,
  status?: number,
  keyword?: string,
  sortBy?: string,
  sortOrder?: string,
) {
  return useQuery({
    queryKey: instructorCertificateKeys.list(page, limit, status, keyword, sortBy, sortOrder),
    queryFn: () => instructorCertificateService.list({ page, limit, status, keyword, sortBy, sortOrder }),
  });
}

export function useInstructorCertificate(id: number) {
  return useQuery({
    queryKey: instructorCertificateKeys.detail(id),
    queryFn: () => instructorCertificateService.getById(String(id)),
    enabled: !!id,
  });
}

export function useApproveInstructorCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => instructorCertificateService.approve(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: instructorCertificateKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: instructorCertificateKeys.detail(id) });
    },
  });
}

export function useRejectInstructorCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectReason }: { id: number; rejectReason: string }) =>
      instructorCertificateService.reject(id, rejectReason),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: instructorCertificateKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: instructorCertificateKeys.detail(id) });
    },
  });
}
