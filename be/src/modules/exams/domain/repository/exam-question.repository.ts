import { ExamQuestion } from '../entity/exam-question.entity';
export const EXAM_QUESTION_REPOSITORY = Symbol('EXAM_QUESTION_REPOSITORY');
export interface IExamQuestionRepository {
  findBySectionId(sectionId: number): Promise<ExamQuestion[]>;
  findById(id: number): Promise<ExamQuestion | null>;
  save(question: ExamQuestion): Promise<ExamQuestion>;
  delete(id: number): Promise<void>;
  deleteAllBySectionId(sectionId: number): Promise<void>;
}
