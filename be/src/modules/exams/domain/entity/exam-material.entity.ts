import { ExamMaterialType } from '../enums/exam-material-type.enum';

export class ExamMaterial {
  private constructor(
    public id: number | null,
    public sectionId: number,
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
    sectionId: number;
    type: ExamMaterialType;
    title?: string | null;
    content?: string | null;
    fileUrl?: string | null;
    transcript?: string | null;
    position: number;
  }): ExamMaterial {
    return new ExamMaterial(
      null,
      params.sectionId,
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
    sectionId: number;
    type: ExamMaterialType;
    title: string | null;
    content: string | null;
    fileUrl: string | null;
    transcript: string | null;
    position: number;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): ExamMaterial {
    return new ExamMaterial(
      params.id,
      params.sectionId,
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

  update(params: Partial<Pick<ExamMaterial, 'type' | 'title' | 'content' | 'fileUrl' | 'transcript' | 'position'>>) {
    if (params.type !== undefined) this.type = params.type;
    if (params.title !== undefined) this.title = params.title;
    if (params.content !== undefined) this.content = params.content;
    if (params.fileUrl !== undefined) this.fileUrl = params.fileUrl;
    if (params.transcript !== undefined) this.transcript = params.transcript;
    if (params.position !== undefined) this.position = params.position;
  }
}
