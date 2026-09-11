import type { PayoutAccount } from "@/features/instructors/types/payout-account";
import { adminApi } from "@/shared/lib/axios.ts";

export const payoutAccountService = {
  async listByInstructor(instructorProfileId: string): Promise<{ data: PayoutAccount[] }> {
    const response = await adminApi.get("/payout-accounts", {
      params: { instructorProfileId },
    });
    return response.data;
  },

  async create(data: {
    instructorProfileId: string;
    accountType: string;
    accountHolderName: string;
    accountNumber?: string;
    bankName?: string;
    bankBranch?: string;
    routingCode?: string;
    paypalEmail?: string;
    currency?: string;
    isPrimary?: boolean;
  }): Promise<PayoutAccount> {
    const response = await adminApi.post("/payout-accounts", data);
    return response.data.data;
  },

  async update(
    id: string,
    data: {
      accountType?: string;
      accountHolderName?: string;
      accountNumber?: string;
      bankName?: string;
      bankBranch?: string;
      routingCode?: string;
      paypalEmail?: string;
      currency?: string;
      isPrimary?: boolean;
      isActive?: boolean;
    },
  ): Promise<PayoutAccount> {
    const response = await adminApi.patch(`/payout-accounts/${id}`, data);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await adminApi.delete(`/payout-accounts/${id}`);
  },
};
