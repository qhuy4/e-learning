import { instructorApi } from "@/shared/lib/axios";
import type {
  RecurringAvailability,
  ExceptionAvailability,
  CreateRecurringRequest,
  UpdateRecurringRequest,
  CreateExceptionRequest,
  UpdateExceptionRequest,
} from "../types/availability.types";

export const availabilityService = {
  // Recurring
  async getRecurring(): Promise<RecurringAvailability[]> {
    const res = await instructorApi.get("/availability/recurring");
    return res.data.data;
  },

  async createRecurring(data: CreateRecurringRequest): Promise<RecurringAvailability> {
    const res = await instructorApi.post("/availability/recurring", data);
    return res.data.data;
  },

  async updateRecurring(id: number, data: UpdateRecurringRequest): Promise<RecurringAvailability> {
    const res = await instructorApi.patch(`/availability/recurring/${id}`, data);
    return res.data.data;
  },

  async deleteRecurring(id: number): Promise<void> {
    await instructorApi.delete(`/availability/recurring/${id}`);
  },

  // Exceptions
  async getExceptions(): Promise<ExceptionAvailability[]> {
    const res = await instructorApi.get("/availability/exceptions");
    return res.data.data;
  },

  async createException(data: CreateExceptionRequest): Promise<ExceptionAvailability> {
    const res = await instructorApi.post("/availability/exceptions", data);
    return res.data.data;
  },

  async updateException(id: number, data: UpdateExceptionRequest): Promise<ExceptionAvailability> {
    const res = await instructorApi.patch(`/availability/exceptions/${id}`, data);
    return res.data.data;
  },

  async deleteException(id: number): Promise<void> {
    await instructorApi.delete(`/availability/exceptions/${id}`);
  },
};
