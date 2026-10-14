import { ExamAttempt } from '../entity/exam-attempt.entity';
export const EXAM_ATTEMPT_REPOSITORY = Symbol('EXAM_ATTEMPT_REPOSITORY');
export interface IExamAttemptRepository {
  findById(id: number): Promise<ExamAttempt | null>;
  findByExamAndUser(examId: number, userId: number): Promise<ExamAttempt | null>;
  /** Mọi attempt của (exam, user), mới nhất trước. */
  findByExamAndUserAll(examId: number, userId: number): Promise<ExamAttempt[]>;
  /** Latest attempts of a user across all exams (for history lists). */
  findByUserId(userId: number, limit?: number): Promise<ExamAttempt[]>;
  create(attempt: ExamAttempt): Promise<ExamAttempt>;
  update(attempt: ExamAttempt): Promise<ExamAttempt>;
}
