import { useQuery } from "@tanstack/react-query";
import { enrollmentService } from "../services/enrollment.service";

export const useMyEnrollments = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["my-enrollments", params],
    queryFn: () => enrollmentService.getMyEnrollments(params),
  });
};

export const useEnrollmentCheck = (courseId: number) => {
  return useQuery({
    queryKey: ["enrollment-check", courseId],
    queryFn: () => enrollmentService.checkEnrollment(courseId),
    enabled: !!courseId,
  });
};
