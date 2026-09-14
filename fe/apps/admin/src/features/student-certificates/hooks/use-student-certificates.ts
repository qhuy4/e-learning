import { useQuery } from "@tanstack/react-query";
import { studentCertificateService } from "@/features/student-certificates/services/student-certificate.service";

export const studentCertificateKeys = {
  all: ["studentCertificates"] as const,
  lists: () => [...studentCertificateKeys.all, "list"] as const,
  list: (page: number, limit: number, keyword?: string, sortBy?: string, sortOrder?: string) =>
    [...studentCertificateKeys.lists(), { page, limit, keyword, sortBy, sortOrder }] as const,
  details: () => [...studentCertificateKeys.all, "detail"] as const,
  detail: (id: number) => [...studentCertificateKeys.details(), id] as const,
};

export function useStudentCertificates(
  page: number,
  limit: number,
  keyword?: string,
  sortBy?: string,
  sortOrder?: string,
) {
  return useQuery({
    queryKey: studentCertificateKeys.list(page, limit, keyword, sortBy, sortOrder),
    queryFn: () => studentCertificateService.list({ page, limit, keyword, sortBy, sortOrder }),
  });
}

export function useStudentCertificate(id: number) {
  return useQuery({
    queryKey: studentCertificateKeys.detail(id),
    queryFn: () => studentCertificateService.getById(String(id)),
    enabled: !!id,
  });
}
