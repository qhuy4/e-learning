import { useQuery } from "@tanstack/react-query";
import { reviewService } from "../services/review.service";

export function useCourseReviews(courseId: string | undefined) {
  return useQuery({
    queryKey: ["course-reviews", courseId],
    queryFn: () => reviewService.getCourseReviews(courseId!),
    enabled: !!courseId,
  });
}
