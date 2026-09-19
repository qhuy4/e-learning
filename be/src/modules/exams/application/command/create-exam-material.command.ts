import { ExamMaterialType } from '../../domain/enums/exam-material-type.enum';

export class CreateExamMaterialCommand {
  constructor(
    public readonly dto: {
      sectionId: number;
      type: ExamMaterialType;
      title?: string;
      content?: string;
      fileUrl?: string;
      transcript?: string;
      position: number;
    },
    public readonly createdBy?: string,
  ) {}
}
