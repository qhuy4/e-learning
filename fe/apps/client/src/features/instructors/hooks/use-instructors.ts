import { useQuery } from "@tanstack/react-query";
import { instructorService } from "../services/instructor.service";
import type { AvailabilityWindow, GetInstructorsParams } from "../types/instructor.type";

export const useAvailableInstructors = (bookingDate?: string) => {
  return useQuery({
    queryKey: ["available-instructors", bookingDate],
    queryFn: () => instructorService.getAvailableInstructors({ bookingDate }),
  });
};

export const useInstructors = (params?: GetInstructorsParams) => {
  return useQuery({
    queryKey: ["instructors", params],
    queryFn: () => instructorService.getInstructors(params),
  });
};

export const useInstructorDetail = (id: number) => {
  return useQuery({
    queryKey: ["instructor", id],
    queryFn: () => instructorService.getInstructorDetail(id),
    enabled: id > 0,
  });
};

export const useAvailabilityWindow = (
  bookingDate?: string,
  instructorId?: number,
) => {
  return useQuery({
    queryKey: ["instructor-window", bookingDate, instructorId],
    queryFn: () =>
      instructorService.getAvailabilityWindow(bookingDate!, instructorId!),
    enabled: !!bookingDate && !!instructorId,
  });
};

export const useDayWindows = (
  bookingDates: string[],
  instructorId?: number,
) => {
  return useQuery({
    queryKey: ["instructor-day-windows", instructorId, bookingDates],
    queryFn: async () => {
      const results = await Promise.all(
        bookingDates.map((d) =>
          instructorService.getAvailabilityWindow(d, instructorId!),
        ),
      );
      return Object.fromEntries(
        bookingDates.map((d, i) => [d, results[i]]),
      ) as Record<string, AvailabilityWindow>;
    },
    enabled: !!instructorId && bookingDates.length > 0,
  });
};

export const useSlotAvailability = (
  bookingDate: string | undefined,
  instructorId: number | undefined,
  slots: string[],
  durationMinutes: number,
) => {
  return useQuery({
    queryKey: ["instructor-slots", bookingDate, instructorId, durationMinutes, slots],
    queryFn: () =>
      instructorService.checkSlots(
        bookingDate!,
        instructorId!,
        slots,
        durationMinutes,
      ),
    enabled: !!bookingDate && !!instructorId && slots.length > 0,
  });
};
