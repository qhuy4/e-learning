import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { certificateService } from "../services/certificate.service";

export function useCertificates() {
  return useQuery({
    queryKey: ["certificates"],
    queryFn: () => certificateService.getCertificates(),
  });
}

export function useCertificateById(id: number) {
  return useQuery({
    queryKey: ["certificate", id],
    queryFn: () => certificateService.getCertificateById(id),
    enabled: !!id,
  });
}

export function useCreateCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: certificateService.createCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
}

export function useDeleteCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: certificateService.deleteCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
}
