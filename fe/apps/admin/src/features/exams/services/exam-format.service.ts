import { adminApi } from "@/shared/lib/axios.ts";
import type { AdminExamFormat, AdminExamFormatSection, CreateExamFormatDto, UpdateExamFormatDto, CreateExamFormatSectionDto } from "../types/exam";

export const examFormatService = {
  async list(): Promise<AdminExamFormat[]> {
    const response = await adminApi.get("/exam-formats");
    return response.data.data;
  },

  async getById(id: number): Promise<AdminExamFormat> {
    const response = await adminApi.get(`/exam-formats/${id}`);
    return response.data.data;
  },

  async create(data: CreateExamFormatDto): Promise<AdminExamFormat> {
    const response = await adminApi.post("/exam-formats", data);
    return response.data.data;
  },

  async update(id: number, data: UpdateExamFormatDto): Promise<AdminExamFormat> {
    const response = await adminApi.put(`/exam-formats/${id}`, data);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await adminApi.delete(`/exam-formats/${id}`);
  },

  /** Danh sách định dạng đề đã xóa mềm — tab "Đã xóa". */
  async listDeleted(): Promise<AdminExamFormat[]> {
    const response = await adminApi.get("/exam-formats/deleted");
    return response.data.data;
  },

  async restore(id: number): Promise<AdminExamFormat> {
    const response = await adminApi.post(`/exam-formats/${id}/restore`);
    return response.data.data;
  },

  async getSections(formatId: number): Promise<AdminExamFormatSection[]> {
    const response = await adminApi.get(`/exam-formats/${formatId}/sections`);
    return response.data.data;
  },

  async createSection(formatId: number, data: CreateExamFormatSectionDto): Promise<AdminExamFormatSection> {
    const response = await adminApi.post(`/exam-formats/${formatId}/sections`, data);
    return response.data.data;
  },

  async updateSection(sectionId: number, data: Partial<CreateExamFormatSectionDto>): Promise<AdminExamFormatSection> {
    const response = await adminApi.put(`/exam-formats/sections/${sectionId}`, data);
    return response.data.data;
  },

  async removeSection(sectionId: number): Promise<void> {
    await adminApi.delete(`/exam-formats/sections/${sectionId}`);
  },
};
