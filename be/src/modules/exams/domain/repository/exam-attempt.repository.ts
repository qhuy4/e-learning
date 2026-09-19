import { ExamAttempt } from '../entity/exam-attempt.entity';
export const EXAM_ATTEMPT_REPOSITORY = Symbol('EXAM_ATTEMPT_REPOSITORY');
export interface IExamAttemptRepository {
  findById(id: number): Promise<ExamAttempt | null>;
  findByExamAndUser(examId: number, userId: number): Promise<ExamAttempt | null>;
  create(attempt: ExamAttempt): Promise<ExamAttempt>;
  update(attempt: ExamAttempt): Promise<ExamAttempt>;
}
