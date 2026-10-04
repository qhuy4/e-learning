import { ExamFormatSection } from '../entity/exam-format-section.entity';
export const EXAM_FORMAT_SECTION_REPOSITORY = Symbol('EXAM_FORMAT_SECTION_REPOSITORY');
export interface IExamFormatSectionRepository {
  findByExamFormatId(examFormatId: number): Promise<ExamFormatSection[]>;
  findById(id: number): Promise<ExamFormatSection | null>;
  save(section: ExamFormatSection): Promise<ExamFormatSection>;
  saveAll(sections: ExamFormatSection[]): Promise<void>;
  delete(id: number): Promise<void>;
  deleteAllByExamFormatId(examFormatId: number): Promise<void>;
}
