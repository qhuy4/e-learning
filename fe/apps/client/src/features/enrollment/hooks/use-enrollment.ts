import { useQuery } from "@tanstack/react-query";
import { enrollmentService } from "../services/enrollment.service";

export const useMyEnrollments = (
  params?: { page?: number; limit?: number },
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["my-enrollments", params],
    queryFn: () => enrollmentService.getMyEnrollments(params),
    enabled: options?.enabled ?? true,
  });
};

export const useEnrollmentCheck = (courseSlug: string | undefined, enabled?: boolean) => {
  return useQuery({
    queryKey: ["enrollment-check", courseSlug],
    queryFn: () => enrollmentService.checkEnrollment(courseSlug!),
    enabled: (enabled ?? true) && !!courseSlug,
  });
};
