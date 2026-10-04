import { api } from "@fe/lib/axios";
import type { Exam, ExamAttempt, ExamAttemptWithExam, ExamAnswer, SubmitExamAttemptDto } from "../types";

export const examService = {
  async listPublished(): Promise<Exam[]> {
    const response = await api.get("/student/exams");
    return response.data.data;
  },
  /** Current user's latest attempts across all exams (with exam titles). */
  async listMyAttempts(): Promise<ExamAttemptWithExam[]> {
    const response = await api.get("/student/exams/attempts");
    return response.data.data;
  },
  async getById(id: number): Promise<Exam> {
    const response = await api.get(`/student/exams/${id}`);
    return response.data.data;
  },
  async getDetail(id: number): Promise<Exam> {
    const response = await api.get(`/student/exams/${id}/detail`);
    return response.data.data;
  },
  async start(id: number): Promise<ExamAttempt> {
    const response = await api.post(`/student/exams/${id}/start`);
    return response.data.data;
  },
  async submit(attemptId: number, data: SubmitExamAttemptDto): Promise<ExamAttempt> {
    const response = await api.post(`/student/exams/attempts/${attemptId}/submit`, data);
    return response.data.data;
  },
  async getAnswers(attemptId: number): Promise<ExamAnswer[]> {
    const response = await api.get(`/student/exams/attempts/${attemptId}/answers`);
    return response.data.data;
  },
  async getAttempts(examId: number): Promise<ExamAttempt[]> {
    const response = await api.get(`/student/exams/${examId}/attempts`);
    return response.data.data;
  },
};
