import { instructorApi } from "@/shared/lib/axios";
import type {
  CreatePayoutAccountRequest,
  UpdatePayoutAccountRequest,
  PayoutRequest,
  CreateGrantTokenResponse,
  VerifyAccountResponse,
} from "../types/payment.types";

export interface GetPayoutsParams {
  page?: number;
  limit?: number;
  status?: number;
}

export const paymentService = {
  async getPayoutAccounts() {
    const response = await instructorApi.get("/payouts/accounts");
    return response.data;
  },

  async createPayoutAccount(data: CreatePayoutAccountRequest) {
    const response = await instructorApi.post("/payouts/accounts", data);
    return response.data;
  },

  async updatePayoutAccount(id: number, data: UpdatePayoutAccountRequest) {
    const response = await instructorApi.patch(`/payouts/accounts/${id}`, data);
    return response.data;
  },

  async deletePayoutAccount(id: number) {
    const response = await instructorApi.delete(`/payouts/accounts/${id}`);
    return response.data;
  },

  async getPayouts(params: GetPayoutsParams) {
    const response = await instructorApi.get("/payouts", { params });
    return response.data;
  },

  async getPayoutDetail(id: number) {
    const response = await instructorApi.get(`/payouts/${id}`);
    return response.data;
  },

  async requestPayout(data: PayoutRequest) {
    const response = await instructorApi.post("/payouts/request", data);
    return response.data;
  },

  async createGrantToken(accountId: number): Promise<CreateGrantTokenResponse> {
    const response = await instructorApi.post(`/payouts/accounts/${accountId}/link`);
    return response.data;
  },

  async verifyAccount(
    accountId: number,
    publicToken: string
  ): Promise<VerifyAccountResponse> {
    const response = await instructorApi.post(`/payouts/accounts/${accountId}/verify`, {
      publicToken,
    });
    return response.data;
  },
};
