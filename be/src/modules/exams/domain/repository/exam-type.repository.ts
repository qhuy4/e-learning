import { ExamType } from '../entity/exam-type.entity';
export const EXAM_TYPE_REPOSITORY = Symbol('EXAM_TYPE_REPOSITORY');
export interface IExamTypeRepository {
  findById(id: number): Promise<ExamType | null>;
  /** Danh sách active: chỉ loại đề CHƯA xóa mềm. */
  findAll(): Promise<ExamType[]>;
  /** Danh sách đã xóa mềm (deleted_at IS NOT NULL) — trang "Đã xóa" của admin. */
  findDeleted(): Promise<ExamType[]>;
  create(examType: ExamType): Promise<ExamType>;
  update(examType: ExamType): Promise<ExamType>;
  /** Xóa mềm: chỉ set deleted_at — dữ liệu đề thi liên quan giữ nguyên. */
  softDelete(id: number): Promise<void>;
  /** Bỏ cờ xóa mềm — các đề chưa bị xóa riêng sẽ hiển thị lại. */
  restore(id: number): Promise<void>;
  /** Xóa cứng — CHỈ dành cho dọn dữ liệu test/script. */
  delete(id: number): Promise<void>;
}
