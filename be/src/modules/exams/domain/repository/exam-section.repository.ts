import { ExamSection } from '../entity/exam-section.entity';
export const EXAM_SECTION_REPOSITORY = Symbol('EXAM_SECTION_REPOSITORY');
export interface IExamSectionRepository {
  findById(id: number): Promise<ExamSection | null>;
  findByExamId(examId: number): Promise<ExamSection[]>;
  saveAll(sections: ExamSection[]): Promise<void>;
  deleteAllByExamId(examId: number): Promise<void>;
}
