import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { availabilityService } from "../services/availability.service";

export function useRecurringAvailability() {
  return useQuery({
    queryKey: ["availability-recurring"],
    queryFn: availabilityService.getRecurring,
  });
}

export function useExceptionAvailability() {
  return useQuery({
    queryKey: ["availability-exceptions"],
    queryFn: availabilityService.getExceptions,
  });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: availabilityService.createRecurring,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability-recurring"] }),
  });
}

export function useUpdateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof availabilityService.updateRecurring>[1] }) =>
      availabilityService.updateRecurring(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability-recurring"] }),
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: availabilityService.deleteRecurring,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability-recurring"] }),
  });
}

export function useCreateException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: availabilityService.createException,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability-exceptions"] }),
  });
}

export function useUpdateException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof availabilityService.updateException>[1] }) =>
      availabilityService.updateException(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability-exceptions"] }),
  });
}

export function useDeleteException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: availabilityService.deleteException,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability-exceptions"] }),
  });
}
