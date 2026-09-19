import { ExamOption } from '../entity/exam-option.entity';
export const EXAM_OPTION_REPOSITORY = Symbol('EXAM_OPTION_REPOSITORY');
export interface IExamOptionRepository {
  findByQuestionId(questionId: number): Promise<ExamOption[]>;
  saveAll(options: ExamOption[]): Promise<void>;
  deleteAllByQuestionId(questionId: number): Promise<void>;
}
