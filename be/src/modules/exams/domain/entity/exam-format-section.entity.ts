export class ExamFormatSection {
  private constructor(
    public id: number | null,
    public examFormatId: number,
    public name: string,
    public description: string | null,
    public instructions: string | null,
    public position: number,
    public durationSeconds: number | null,
    public questionCount: number,
    /** Kỹ năng: LISTENING / READING / WRITING / SPEAKING (null = chưa gán). */
    public sectionType: string | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    examFormatId: number;
    name: string;
    description?: string | null;
    instructions?: string | null;
    position: number;
    durationSeconds?: number | null;
    questionCount?: number;
    sectionType?: string | null;
  }): ExamFormatSection {
    return new ExamFormatSection(
      null,
      params.examFormatId,
      params.name,
      params.description ?? null,
      params.instructions ?? null,
      params.position,
      params.durationSeconds ?? null,
      params.questionCount ?? 0,
      params.sectionType ?? null,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    examFormatId: number;
    name: string;
    description: string | null;
    instructions: string | null;
    position: number;
    durationSeconds: number | null;
    questionCount: number;
    sectionType: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): ExamFormatSection {
    return new ExamFormatSection(
      params.id,
      params.examFormatId,
      params.name,
      params.description,
      params.instructions,
      params.position,
      params.durationSeconds,
      params.questionCount,
      params.sectionType,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: Partial<Pick<ExamFormatSection, 'name' | 'description' | 'instructions' | 'position' | 'durationSeconds' | 'questionCount' | 'sectionType'>>) {
    if (params.name !== undefined) this.name = params.name;
    if (params.description !== undefined) this.description = params.description;
    if (params.instructions !== undefined) this.instructions = params.instructions;
    if (params.position !== undefined) this.position = params.position;
    if (params.durationSeconds !== undefined) this.durationSeconds = params.durationSeconds;
    if (params.questionCount !== undefined) this.questionCount = params.questionCount;
    if (params.sectionType !== undefined) this.sectionType = params.sectionType;
  }
}
