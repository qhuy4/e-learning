export class ExamFormatSection {
  private constructor(
    public id: number | null,
    public examFormatId: number,
    public code: string,
    public name: string,
    public description: string | null,
    public instructions: string | null,
    public position: number,
    public durationSeconds: number,
    public questionCount: number,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    examFormatId: number;
    code: string;
    name: string;
    description?: string | null;
    instructions?: string | null;
    position: number;
    durationSeconds: number;
    questionCount?: number;
  }): ExamFormatSection {
    return new ExamFormatSection(
      null,
      params.examFormatId,
      params.code,
      params.name,
      params.description ?? null,
      params.instructions ?? null,
      params.position,
      params.durationSeconds,
      params.questionCount ?? 0,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    examFormatId: number;
    code: string;
    name: string;
    description: string | null;
    instructions: string | null;
    position: number;
    durationSeconds: number;
    questionCount: number;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): ExamFormatSection {
    return new ExamFormatSection(
      params.id,
      params.examFormatId,
      params.code,
      params.name,
      params.description,
      params.instructions,
      params.position,
      params.durationSeconds,
      params.questionCount,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: Partial<Pick<ExamFormatSection, 'code' | 'name' | 'description' | 'instructions' | 'position' | 'durationSeconds' | 'questionCount'>>) {
    if (params.code !== undefined) this.code = params.code;
    if (params.name !== undefined) this.name = params.name;
    if (params.description !== undefined) this.description = params.description;
    if (params.instructions !== undefined) this.instructions = params.instructions;
    if (params.position !== undefined) this.position = params.position;
    if (params.durationSeconds !== undefined) this.durationSeconds = params.durationSeconds;
    if (params.questionCount !== undefined) this.questionCount = params.questionCount;
  }
}
