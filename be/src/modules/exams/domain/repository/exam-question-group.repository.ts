import { ExamQuestionGroup } from '../entity/exam-question-group.entity';
export const EXAM_QUESTION_GROUP_REPOSITORY = Symbol('EXAM_QUESTION_GROUP_REPOSITORY');
export interface IExamQuestionGroupRepository {
  findBySectionId(sectionId: number): Promise<ExamQuestionGroup[]>;
  findById(id: number): Promise<ExamQuestionGroup | null>;
  save(group: ExamQuestionGroup): Promise<ExamQuestionGroup>;
  saveAll(groups: ExamQuestionGroup[]): Promise<void>;
  delete(id: number): Promise<void>;
  deleteAllBySectionId(sectionId: number): Promise<void>;
}
