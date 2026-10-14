export class ExamSection {
  private constructor(
    public id: number | null,
    public examId: number,
    public formatSectionId: number,
    public name: string,
    public description: string | null,
    public instructions: string | null,
    public position: number,
    public durationSeconds: number | null,
    public questionCount: number,
    /** Kỹ năng kế thừa từ format: LISTENING / READING / WRITING / SPEAKING. */
    public sectionType: string | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    examId: number;
    formatSectionId: number;
    name: string;
    description?: string | null;
    instructions?: string | null;
    position: number;
    durationSeconds?: number | null;
    questionCount?: number;
    sectionType?: string | null;
  }): ExamSection {
    return new ExamSection(
      null,
      params.examId,
      params.formatSectionId,
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
    examId: number;
    formatSectionId: number;
    name: string;
    description: string | null;
    instructions: string | null;
    position: number;
    durationSeconds: number | null;
    questionCount: number;
    sectionType: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): ExamSection {
    return new ExamSection(
      params.id,
      params.examId,
      params.formatSectionId,
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

  update(params: Partial<Pick<ExamSection, 'name' | 'description' | 'instructions' | 'position' | 'durationSeconds' | 'questionCount' | 'sectionType'>>) {
    if (params.name !== undefined) this.name = params.name;
    if (params.description !== undefined) this.description = params.description;
    if (params.instructions !== undefined) this.instructions = params.instructions;
    if (params.position !== undefined) this.position = params.position;
    if (params.durationSeconds !== undefined) this.durationSeconds = params.durationSeconds;
    if (params.questionCount !== undefined) this.questionCount = params.questionCount;
    if (params.sectionType !== undefined) this.sectionType = params.sectionType;
  }
}
