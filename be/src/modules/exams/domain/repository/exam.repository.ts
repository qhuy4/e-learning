import { Exam } from '../entity/exam.entity';
export const EXAM_REPOSITORY = Symbol('EXAM_REPOSITORY');
export interface IExamRepository {
  findById(id: number): Promise<Exam | null>;
  findByStatus(status: string): Promise<Exam[]>;
  findByCreatedBy(createdBy: number): Promise<Exam[]>;
  findAll(): Promise<Exam[]>;
  create(exam: Exam): Promise<Exam>;
  update(exam: Exam): Promise<Exam>;
  delete(id: number): Promise<void>;
}
