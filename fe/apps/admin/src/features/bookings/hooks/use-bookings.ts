import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/features/bookings/services/booking.service";

export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (page: number, limit: number, params?: Record<string, unknown>) =>
    [...bookingKeys.lists(), { page, limit, ...params }] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: number) => [...bookingKeys.details(), id] as const,
};

export function useBookings(
  page: number,
  limit: number,
  params?: {
    keyword?: string;
    instructorId?: number;
    studentId?: number;
    status?: number;
    bookingDate?: string;
  },
) {
  return useQuery({
    queryKey: bookingKeys.list(page, limit, params),
    queryFn: () => bookingService.list({ page, limit, ...params }),
  });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      bookingService.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookingService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}
