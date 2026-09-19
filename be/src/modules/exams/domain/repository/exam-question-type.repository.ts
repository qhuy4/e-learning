import { ExamQuestionType } from '../entity/exam-question-type.entity';
export const EXAM_QUESTION_TYPE_REPOSITORY = Symbol('EXAM_QUESTION_TYPE_REPOSITORY');
export interface IExamQuestionTypeRepository {
  findById(id: number): Promise<ExamQuestionType | null>;
  findByCode(code: string): Promise<ExamQuestionType | null>;
  findAll(): Promise<ExamQuestionType[]>;
  create(examQuestionType: ExamQuestionType): Promise<ExamQuestionType>;
  update(examQuestionType: ExamQuestionType): Promise<ExamQuestionType>;
  delete(id: number): Promise<void>;
}
