import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payoutAccountService } from "@/features/instructors/services/payout-account.service";

export const payoutAccountKeys = {
  all: ["payout-accounts"] as const,
  list: (instructorProfileId: string) =>
    [...payoutAccountKeys.all, { instructorProfileId }] as const,
};

export function usePayoutAccounts(instructorProfileId: string) {
  return useQuery({
    queryKey: payoutAccountKeys.list(instructorProfileId),
    queryFn: () => payoutAccountService.listByInstructor(instructorProfileId),
    enabled: !!instructorProfileId,
  });
}

export function useCreatePayoutAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof payoutAccountService.create>[0]) =>
      payoutAccountService.create(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: payoutAccountKeys.list(variables.instructorProfileId),
      });
    },
  });
}

export function useUpdatePayoutAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof payoutAccountService.update>[1] }) =>
      payoutAccountService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: payoutAccountKeys.all });
    },
  });
}

export function useDeletePayoutAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payoutAccountService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: payoutAccountKeys.all });
    },
  });
}
