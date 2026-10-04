import { ExamMaterialType } from '../enums/exam-material-type.enum';

export class ExamGroupMaterial {
  private constructor(
    public id: number | null,
    public groupId: number,
    public type: ExamMaterialType,
    public title: string | null,
    public content: string | null,
    public fileUrl: string | null,
    public transcript: string | null,
    public position: number,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    groupId: number;
    type: ExamMaterialType;
    title?: string | null;
    content?: string | null;
    fileUrl?: string | null;
    transcript?: string | null;
    position: number;
  }): ExamGroupMaterial {
    return new ExamGroupMaterial(
      null,
      params.groupId,
      params.type,
      params.title ?? null,
      params.content ?? null,
      params.fileUrl ?? null,
      params.transcript ?? null,
      params.position,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    groupId: number;
    type: ExamMaterialType;
    title: string | null;
    content: string | null;
    fileUrl: string | null;
    transcript: string | null;
    position: number;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): ExamGroupMaterial {
    return new ExamGroupMaterial(
      params.id,
      params.groupId,
      params.type,
      params.title,
      params.content,
      params.fileUrl,
      params.transcript,
      params.position,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: Partial<Pick<ExamGroupMaterial, 'type' | 'title' | 'content' | 'fileUrl' | 'transcript' | 'position'>>) {
    if (params.type !== undefined) this.type = params.type;
    if (params.title !== undefined) this.title = params.title;
    if (params.content !== undefined) this.content = params.content;
    if (params.fileUrl !== undefined) this.fileUrl = params.fileUrl;
    if (params.transcript !== undefined) this.transcript = params.transcript;
    if (params.position !== undefined) this.position = params.position;
  }
}
