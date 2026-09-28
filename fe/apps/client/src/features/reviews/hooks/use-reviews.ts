import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, type CreateReviewParams } from '../services/review.service';

export const useCourseReviews = (
  courseId: string | number,
  params?: { page?: number; limit?: number; rating?: number; sortOrder?: 'asc' | 'desc'; hasImage?: boolean }
) => {
  const validId = courseId !== undefined && courseId !== null && courseId !== '';
  return useQuery({
    queryKey: ['reviews', 'list', String(courseId), params],
    queryFn: () => reviewService.getCourseReviews(courseId, params),
    enabled: validId,
    placeholderData: (previousData) => previousData,
  });
};

export const useReviewEligibility = (
  courseId: string | number,
  isAuthenticated: boolean
) => {
  const validId = courseId !== undefined && courseId !== null && courseId !== '';
  return useQuery({
    queryKey: ['reviews', 'eligibility', String(courseId)],
    queryFn: () => reviewService.getReviewEligibility(courseId),
    enabled: isAuthenticated && validId,
  });
};

export const useCreateOrUpdateReview = (courseId: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewParams) =>
      reviewService.createOrUpdateReview(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
  });
};

export const useDeleteReview = (_courseId?: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string | number) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
  });
};
