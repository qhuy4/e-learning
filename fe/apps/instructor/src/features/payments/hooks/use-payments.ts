import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService, type GetPayoutsParams } from "../services/payment.service";

export function usePayoutAccounts() {
  return useQuery({
    queryKey: ["payout-accounts"],
    queryFn: () => paymentService.getPayoutAccounts(),
  });
}

export function useCreatePayoutAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentService.createPayoutAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-accounts"] });
    },
  });
}

export function useUpdatePayoutAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof paymentService.updatePayoutAccount>[1] }) =>
      paymentService.updatePayoutAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-accounts"] });
    },
  });
}

export function useDeletePayoutAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => paymentService.deletePayoutAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-accounts"] });
    },
  });
}

export function usePayouts(params: GetPayoutsParams) {
  return useQuery({
    queryKey: ["payouts", params],
    queryFn: () => paymentService.getPayouts(params),
  });
}

export function usePayoutDetail(id: number) {
  return useQuery({
    queryKey: ["payout", id],
    queryFn: () => paymentService.getPayoutDetail(id),
    enabled: id > 0,
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentService.requestPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      queryClient.invalidateQueries({ queryKey: ["revenue-summary"] });
    },
  });
}

export function useCreateGrantToken() {
  return useMutation({
    mutationFn: (accountId: number) => paymentService.createGrantToken(accountId),
  });
}

export function useVerifyAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      accountId,
      publicToken,
    }: {
      accountId: number;
      publicToken: string;
    }) => paymentService.verifyAccount(accountId, publicToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-accounts"] });
    },
  });
}
