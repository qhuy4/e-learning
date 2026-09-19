import { ExamStatus } from '../enums/exam-status.enum';

export class Exam {
  private constructor(
    public id: number | null,
    public examFormatId: number,
    public title: string,
    public description: string | null,
    public isPremium: boolean,
    public durationSeconds: number,
    public status: ExamStatus,
    public createdBy: number | null,
    public publishedAt: Date | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    examFormatId: number;
    title: string;
    description?: string | null;
    isPremium?: boolean;
    durationSeconds: number;
    createdBy?: number | null;
  }): Exam {
    return new Exam(
      null,
      params.examFormatId,
      params.title,
      params.description ?? null,
      params.isPremium ?? false,
      params.durationSeconds,
      ExamStatus.DRAFT,
      params.createdBy ?? null,
      null,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    examFormatId: number;
    title: string;
    description: string | null;
    isPremium: boolean;
    durationSeconds: number;
    status: ExamStatus;
    createdBy: number | null;
    publishedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): Exam {
    return new Exam(
      params.id,
      params.examFormatId,
      params.title,
      params.description,
      params.isPremium,
      params.durationSeconds,
      params.status,
      params.createdBy,
      params.publishedAt,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: Partial<Pick<Exam, 'title' | 'description' | 'isPremium' | 'durationSeconds' | 'status'>>) {
    if (params.title !== undefined) this.title = params.title;
    if (params.description !== undefined) this.description = params.description;
    if (params.isPremium !== undefined) this.isPremium = params.isPremium;
    if (params.durationSeconds !== undefined) this.durationSeconds = params.durationSeconds;
    if (params.status !== undefined) this.status = params.status;
  }
}
