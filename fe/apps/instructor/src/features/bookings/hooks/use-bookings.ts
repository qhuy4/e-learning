import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bookingService,
  type GetBookingsParams,
} from "@/features/bookings/services/booking.service";

export const bookingKeys = {
  all: ["instructor-bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (params: GetBookingsParams) => [...bookingKeys.lists(), params] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: number) => [...bookingKeys.details(), id] as const,
};

export function useBookings(params: GetBookingsParams) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => bookingService.getBookings(params),
  });
}

export function useBookingDetail(id: number) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingService.getBookingDetail(id),
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
      void queryClient.invalidateQueries({
        queryKey: bookingKeys.detail(variables.id),
      });
    },
  });
}
