import { ExamGroupMaterial } from '../entity/exam-group-material.entity';
export const EXAM_GROUP_MATERIAL_REPOSITORY = Symbol('EXAM_GROUP_MATERIAL_REPOSITORY');
export interface IExamGroupMaterialRepository {
  findByGroupId(groupId: number): Promise<ExamGroupMaterial[]>;
  findById(id: number): Promise<ExamGroupMaterial | null>;
  save(material: ExamGroupMaterial): Promise<ExamGroupMaterial>;
  delete(id: number): Promise<void>;
  deleteAllByGroupId(groupId: number): Promise<void>;
}
