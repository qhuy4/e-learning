import { ExamType } from '../entity/exam-type.entity';
export const EXAM_TYPE_REPOSITORY = Symbol('EXAM_TYPE_REPOSITORY');
export interface IExamTypeRepository {
  findById(id: number): Promise<ExamType | null>;
  findByCode(code: string): Promise<ExamType | null>;
  findAll(): Promise<ExamType[]>;
  create(examType: ExamType): Promise<ExamType>;
  update(examType: ExamType): Promise<ExamType>;
  delete(id: number): Promise<void>;
}
