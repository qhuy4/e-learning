import { useQuery } from "@tanstack/react-query";
import { mentorService } from "../services/mentor.service";
import type { AvailabilityWindow, GetMentorsParams } from "../types/mentor.type";

export const useAvailableTeachers = (bookingDate?: string) => {
  return useQuery({
    queryKey: ["available-teachers", bookingDate],
    queryFn: () => mentorService.getAvailableTeachers({ bookingDate }),
  });
};

export const useMentors = (params?: GetMentorsParams) => {
  return useQuery({
    queryKey: ["mentors", params],
    queryFn: () => mentorService.getMentors(params),
  });
};

export const useMentorDetail = (id: number) => {
  return useQuery({
    queryKey: ["mentor", id],
    queryFn: () => mentorService.getMentorDetail(id),
    enabled: id > 0,
  });
};

export const useAvailabilityWindow = (
  bookingDate?: string,
  instructorId?: number,
) => {
  return useQuery({
    queryKey: ["mentor-window", bookingDate, instructorId],
    queryFn: () =>
      mentorService.getAvailabilityWindow(bookingDate!, instructorId!),
    enabled: !!bookingDate && !!instructorId,
  });
};

export const useDayWindows = (
  bookingDates: string[],
  instructorId?: number,
) => {
  return useQuery({
    queryKey: ["mentor-day-windows", instructorId, bookingDates],
    queryFn: async () => {
      const results = await Promise.all(
        bookingDates.map((d) =>
          mentorService.getAvailabilityWindow(d, instructorId!),
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
    queryKey: ["mentor-slots", bookingDate, instructorId, durationMinutes, slots],
    queryFn: () =>
      mentorService.checkSlots(
        bookingDate!,
        instructorId!,
        slots,
        durationMinutes,
      ),
    enabled: !!bookingDate && !!instructorId && slots.length > 0,
  });
};
