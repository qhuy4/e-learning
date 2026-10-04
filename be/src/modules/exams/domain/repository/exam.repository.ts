import { Exam } from '../entity/exam.entity';
export const EXAM_REPOSITORY = Symbol('EXAM_REPOSITORY');

/**
 * Exam enriched with the display names of its type and format
 * (exam_formats -> exam_types): `examTypeName` = LOẠI đề ("TOEIC" | "IELTS" |
 * "GENERAL") — FE dùng để chọn giao diện; `examFormatName` = ĐỊNH DẠNG đề
 * (VD "TOEIC Format 2026") — hiển thị ở thẻ đề / trang chi tiết.
 */
export type ExamWithTypeName = Exam & {
  examTypeName: string | null;
  examFormatName: string | null;
};

export interface IExamRepository {
  findById(id: number): Promise<Exam | null>;
  findByIdWithTypeName(id: number): Promise<ExamWithTypeName | null>;
  findByStatus(status: string): Promise<Exam[]>;
  findPublishedWithTypeName(): Promise<ExamWithTypeName[]>;
  findByCreatedBy(createdBy: number): Promise<Exam[]>;
  /**
   * Danh sách active: exam CHƯA xóa mềm VÀ loại đề (exam_types qua
   * exam_formats) chưa xóa mềm — loại đề bị xóa thì các đề thuộc loại đó ẩn.
   */
  findAll(): Promise<Exam[]>;
  /** Danh sách đã xóa mềm (deleted_at IS NOT NULL) — trang "Đã xóa" của admin. */
  findDeleted(): Promise<Exam[]>;
  create(exam: Exam): Promise<Exam>;
  update(exam: Exam): Promise<Exam>;
  /** Xóa mềm: chỉ set deleted_at — giữ nguyên sections/questions/attempts/answers. */
  softDelete(id: number): Promise<void>;
  /** Bỏ cờ xóa mềm (exam chỉ hiển thị lại khi loại đề đang active). */
  restore(id: number): Promise<void>;
  /**
   * Xóa cứng — CHỈ dành cho dọn dữ liệu test/script; admin UI luôn dùng softDelete.
   */
  delete(id: number): Promise<void>;
  /**
   * Sao chép toàn bộ đề thi (sections → groups → materials → questions →
   * options) trong MỘT transaction. Bản sao luôn là DRAFT, không kèm
   * attempts/answers. Trả về null nếu đề gốc không tồn tại.
   */
  duplicate(
    id: number,
    params: { title: string; createdBy: number | null },
  ): Promise<Exam | null>;
}
