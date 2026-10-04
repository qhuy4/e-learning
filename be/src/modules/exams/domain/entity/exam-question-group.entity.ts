import { ExamGroupType } from '../enums/exam-group-type.enum';

export class ExamQuestionGroup {
  private constructor(
    public id: number | null,
    public sectionId: number,
    public groupType: ExamGroupType,
    public title: string | null,
    public instructions: string | null,
    public position: number,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    sectionId: number;
    groupType?: ExamGroupType;
    title?: string | null;
    instructions?: string | null;
    position: number;
  }): ExamQuestionGroup {
    return new ExamQuestionGroup(
      null,
      params.sectionId,
      params.groupType ?? ExamGroupType.CUSTOM,
      params.title ?? null,
      params.instructions ?? null,
      params.position,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    sectionId: number;
    groupType: ExamGroupType;
    title: string | null;
    instructions: string | null;
    position: number;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): ExamQuestionGroup {
    return new ExamQuestionGroup(
      params.id,
      params.sectionId,
      params.groupType,
      params.title,
      params.instructions,
      params.position,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: Partial<Pick<ExamQuestionGroup, 'groupType' | 'title' | 'instructions' | 'position'>>) {
    if (params.groupType !== undefined) this.groupType = params.groupType;
    if (params.title !== undefined) this.title = params.title;
    if (params.instructions !== undefined) this.instructions = params.instructions;
    if (params.position !== undefined) this.position = params.position;
  }
}
