import { adminApi } from "@/shared/lib/axios.ts";
import type {
  AdminExam,
  CreateExamDto,
  UpdateExamDto,
  AdminExamSection,
  AdminExamQuestionGroup,
  AdminExamGroupMaterial,
  AdminExamQuestion,
  AdminExamOption,
  CreateExamGroupMaterialDto,
  UpdateExamGroupMaterialDto,
  CreateExamQuestionDto,
  UpdateExamQuestionDto,
  ExamGroupType,
} from "../types/exam";

export const examService = {
  async list(): Promise<AdminExam[]> {
    const response = await adminApi.get("/exams");
    return response.data.data;
  },

  async getById(id: number): Promise<AdminExam> {
    const response = await adminApi.get(`/exams/${id}`);
    return response.data.data;
  },

  async create(data: CreateExamDto): Promise<AdminExam> {
    const response = await adminApi.post("/exams", data);
    return response.data.data;
  },

  async update(id: number, data: UpdateExamDto): Promise<AdminExam> {
    const response = await adminApi.put(`/exams/${id}`, data);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await adminApi.delete(`/exams/${id}`);
  },

  /** Đề đã xóa mềm — trang "Đã xóa" của admin. */
  async listDeleted(): Promise<AdminExam[]> {
    const response = await adminApi.get("/exams/deleted");
    return response.data.data;
  },

  /** Khôi phục đề đã xóa mềm (chỉ hiển thị lại khi loại đề đang active). */
  async restore(id: number): Promise<AdminExam> {
    const response = await adminApi.post(`/exams/${id}/restore`);
    return response.data.data;
  },

  /** Sao chép toàn bộ đề thành 1 đề mới (DRAFT) — BE chạy trong 1 transaction. */
  async duplicate(id: number): Promise<AdminExam> {
    const response = await adminApi.post(`/exams/${id}/duplicate`);
    return response.data.data;
  },

  async publish(id: number): Promise<AdminExam> {
    const response = await adminApi.put(`/exams/${id}/publish`);
    return response.data.data;
  },

  async archive(id: number): Promise<AdminExam> {
    const response = await adminApi.put(`/exams/${id}/archive`);
    return response.data.data;
  },

  async getSections(examId: number): Promise<AdminExamSection[]> {
    const response = await adminApi.get(`/exams/${examId}/sections`);
    return response.data.data;
  },

  async getExamDetail(id: number): Promise<AdminExam> {
    const response = await adminApi.get(`/exams/${id}/detail`);
    return response.data.data;
  },

  // Question Group methods
  async getQuestionGroups(sectionId: number): Promise<AdminExamQuestionGroup[]> {
    const response = await adminApi.get(`/exam-question-groups/section/${sectionId}`);
    return response.data.data;
  },

  async createQuestionGroup(sectionId: number, data: { groupType?: ExamGroupType; title?: string; instructions?: string; position: number }): Promise<AdminExamQuestionGroup> {
    const response = await adminApi.post(`/exam-question-groups/section/${sectionId}`, data);
    return response.data.data;
  },

  async updateQuestionGroup(id: number, data: { groupType?: ExamGroupType; title?: string; instructions?: string; position?: number }): Promise<AdminExamQuestionGroup> {
    const response = await adminApi.put(`/exam-question-groups/${id}`, data);
    return response.data.data;
  },

  async removeQuestionGroup(id: number): Promise<void> {
    await adminApi.delete(`/exam-question-groups/${id}`);
  },

  // Group Material methods
  async getMaterialsByGroup(groupId: number): Promise<AdminExamGroupMaterial[]> {
    const response = await adminApi.get(`/exam-group-materials/group/${groupId}`);
    return response.data.data;
  },

  async createGroupMaterial(groupId: number, data: CreateExamGroupMaterialDto): Promise<AdminExamGroupMaterial> {
    const response = await adminApi.post(`/exam-group-materials/group/${groupId}`, data);
    return response.data.data;
  },

  async updateGroupMaterial(id: number, data: UpdateExamGroupMaterialDto): Promise<AdminExamGroupMaterial> {
    const response = await adminApi.put(`/exam-group-materials/${id}`, data);
    return response.data.data;
  },

  async removeGroupMaterial(id: number): Promise<void> {
    await adminApi.delete(`/exam-group-materials/${id}`);
  },

  async uploadFile(file: File): Promise<{ url: string; key: string; originalName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await adminApi.post<{ data: { url: string; key: string; originalName: string } }>(
      '/exam-group-materials/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  },

  // Question methods (group-based)
  async getQuestionsByGroup(groupId: number): Promise<AdminExamQuestion[]> {
    const response = await adminApi.get(`/exam-question-groups/${groupId}/questions`);
    return response.data.data;
  },

  async createQuestion(groupId: number, data: CreateExamQuestionDto): Promise<AdminExamQuestion> {
    const response = await adminApi.post(`/exam-question-groups/${groupId}/questions`, data);
    return response.data.data;
  },

  // Question methods (section-based, for direct/ungrouped questions)
  async getQuestionsBySection(sectionId: number): Promise<AdminExamQuestion[]> {
    const response = await adminApi.get(`/exam-sections/${sectionId}/questions`);
    return response.data.data;
  },

  async createQuestionInSection(sectionId: number, data: CreateExamQuestionDto): Promise<AdminExamQuestion> {
    const response = await adminApi.post(`/exam-sections/${sectionId}/questions`, data);
    return response.data.data;
  },

  async updateQuestion(id: number, data: UpdateExamQuestionDto): Promise<AdminExamQuestion> {
    const response = await adminApi.put(`/exam-sections/questions/${id}`, data);
    return response.data.data;
  },

  async removeQuestion(id: number): Promise<void> {
    await adminApi.delete(`/exam-sections/questions/${id}`);
  },

  async getQuestionOptions(questionId: number): Promise<AdminExamOption[]> {
    const response = await adminApi.get(`/exam-question-groups/questions/${questionId}/options`);
    return response.data.data;
  },
};
