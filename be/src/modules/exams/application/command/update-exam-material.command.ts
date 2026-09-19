import { ExamMaterialType } from '../../domain/enums/exam-material-type.enum';

export class UpdateExamMaterialCommand {
  constructor(
    public readonly id: number,
    public readonly dto: {
      type?: ExamMaterialType;
      title?: string;
      content?: string;
      fileUrl?: string;
      transcript?: string;
      position?: number;
    },
    public readonly createdBy?: string,
  ) {}
}
