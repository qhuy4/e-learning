import { adminApi } from "@/shared/lib/axios.ts";
import type { AdminExamType, CreateExamTypeDto, UpdateExamTypeDto } from "../types/exam";

export const examTypeService = {
  async list(): Promise<AdminExamType[]> {
    const response = await adminApi.get("/exam-types");
    return response.data.data;
  },

  async getById(id: number): Promise<AdminExamType> {
    const response = await adminApi.get(`/exam-types/${id}`);
    return response.data.data;
  },

  async create(data: CreateExamTypeDto): Promise<AdminExamType> {
    const response = await adminApi.post("/exam-types", data);
    return response.data.data;
  },

  async update(id: number, data: UpdateExamTypeDto): Promise<AdminExamType> {
    const response = await adminApi.put(`/exam-types/${id}`, data);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await adminApi.delete(`/exam-types/${id}`);
  },

  /** Loại đề đã xóa mềm — trang "Đã xóa" của admin. */
  async listDeleted(): Promise<AdminExamType[]> {
    const response = await adminApi.get("/exam-types/deleted");
    return response.data.data;
  },

  /** Khôi phục loại đề — các đề chưa bị xóa riêng sẽ hiển thị lại ngay. */
  async restore(id: number): Promise<AdminExamType> {
    const response = await adminApi.post(`/exam-types/${id}/restore`);
    return response.data.data;
  },
};
