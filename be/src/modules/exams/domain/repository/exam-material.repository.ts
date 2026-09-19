import { ExamMaterial } from '../entity/exam-material.entity';
export const EXAM_MATERIAL_REPOSITORY = Symbol('EXAM_MATERIAL_REPOSITORY');
export interface IExamMaterialRepository {
  findBySectionId(sectionId: number): Promise<ExamMaterial[]>;
  findById(id: number): Promise<ExamMaterial | null>;
  save(material: ExamMaterial): Promise<ExamMaterial>;
  delete(id: number): Promise<void>;
  deleteAllBySectionId(sectionId: number): Promise<void>;
}
