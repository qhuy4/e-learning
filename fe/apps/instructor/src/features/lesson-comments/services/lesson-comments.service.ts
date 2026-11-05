import { instructorApi, instructorRootApi } from "@/shared/lib/axios";
import type { CommentStatusFilter } from "@/features/lesson-comments/types/lesson-comments";

export interface InstructorCommentsParams {
  /** Lọc theo khóa (bỏ trống = mọi khóa của giảng viên) */
  courseId?: number;
  /** Lọc theo bài học (bỏ trống = mọi bài) */
  lessonId?: number;
  /** answered = đã có giảng viên trả lời, unanswered = chưa */
  status?: CommentStatusFilter;
  page?: number;
  limit?: number;
}

export const lessonCommentsService = {
  // GET /instructor/lesson-comments — danh sách câu hỏi + thống kê
  // (BE đã kiểm tra quyền: chỉ bài học thuộc khóa của giảng viên này).
  async getList(params: InstructorCommentsParams) {
    const response = await instructorApi.get("/lesson-comments", { params });
    return response.data;
  },

  // GET /instructor/lesson-comments/thread/:rootId — nhánh bình luận đầy đủ
  async getThread(rootId: number) {
    const response = await instructorApi.get(
      `/lesson-comments/thread/${rootId}`,
    );
    return response.data;
  },

  // Trả lời comment — dùng chung POST /lesson-comments với student
  // (instructor JWT hợp lệ, BE cho phép giảng viên của khóa bình luận).
  async reply(payload: {
    lessonId: number;
    content: string;
    parentId?: number | null;
  }) {
    const response = await instructorRootApi.post("/lesson-comments", payload);
    return response.data;
  },
};
