export class ExamSection {
  private constructor(
    public id: number | null,
    public examId: number,
    public formatSectionId: number,
    public code: string,
    public name: string,
    public instructions: string | null,
    public position: number,
    public durationSeconds: number,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    examId: number;
    formatSectionId: number;
    code: string;
    name: string;
    instructions?: string | null;
    position: number;
    durationSeconds: number;
  }): ExamSection {
    return new ExamSection(
      null,
      params.examId,
      params.formatSectionId,
      params.code,
      params.name,
      params.instructions ?? null,
      params.position,
      params.durationSeconds,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    examId: number;
    formatSectionId: number;
    code: string;
    name: string;
    instructions: string | null;
    position: number;
    durationSeconds: number;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): ExamSection {
    return new ExamSection(
      params.id,
      params.examId,
      params.formatSectionId,
      params.code,
      params.name,
      params.instructions,
      params.position,
      params.durationSeconds,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: Partial<Pick<ExamSection, 'code' | 'name' | 'instructions' | 'position' | 'durationSeconds'>>) {
    if (params.code !== undefined) this.code = params.code;
    if (params.name !== undefined) this.name = params.name;
    if (params.instructions !== undefined) this.instructions = params.instructions;
    if (params.position !== undefined) this.position = params.position;
    if (params.durationSeconds !== undefined) this.durationSeconds = params.durationSeconds;
  }
}
