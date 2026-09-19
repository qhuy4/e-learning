import { ExamAnswer } from '../entity/exam-answer.entity';
export const EXAM_ANSWER_REPOSITORY = Symbol('EXAM_ANSWER_REPOSITORY');
export interface IExamAnswerRepository {
  findByAttemptId(attemptId: number): Promise<ExamAnswer[]>;
  saveAll(answers: ExamAnswer[]): Promise<void>;
}
