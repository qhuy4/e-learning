import { ExamFormat } from '../entity/exam-format.entity';
export const EXAM_FORMAT_REPOSITORY = Symbol('EXAM_FORMAT_REPOSITORY');
export interface IExamFormatRepository {
  findById(id: number): Promise<ExamFormat | null>;
  findByCode(code: string): Promise<ExamFormat | null>;
  findByExamTypeId(examTypeId: number): Promise<ExamFormat[]>;
  findAll(): Promise<ExamFormat[]>;
  create(examFormat: ExamFormat): Promise<ExamFormat>;
  update(examFormat: ExamFormat): Promise<ExamFormat>;
  delete(id: number): Promise<void>;
}
