export class ExamQuestion {
  private constructor(
    public id: number | null,
    public sectionId: number,
    public materialId: number | null,
    public questionTypeId: number,
    public question: string,
    public explanation: string | null,
    public points: number,
    public position: number,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    sectionId: number;
    materialId?: number | null;
    questionTypeId: number;
    question: string;
    explanation?: string | null;
    points?: number;
    position: number;
  }): ExamQuestion {
    return new ExamQuestion(
      null,
      params.sectionId,
      params.materialId ?? null,
      params.questionTypeId,
      params.question,
      params.explanation ?? null,
      params.points ?? 1,
      params.position,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    sectionId: number;
    materialId: number | null;
    questionTypeId: number;
    question: string;
    explanation: string | null;
    points: number;
    position: number;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): ExamQuestion {
    return new ExamQuestion(
      params.id,
      params.sectionId,
      params.materialId,
      params.questionTypeId,
      params.question,
      params.explanation,
      params.points,
      params.position,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: Partial<Pick<ExamQuestion, 'materialId' | 'questionTypeId' | 'question' | 'explanation' | 'points' | 'position'>>) {
    if (params.materialId !== undefined) this.materialId = params.materialId;
    if (params.questionTypeId !== undefined) this.questionTypeId = params.questionTypeId;
    if (params.question !== undefined) this.question = params.question;
    if (params.explanation !== undefined) this.explanation = params.explanation;
    if (params.points !== undefined) this.points = params.points;
    if (params.position !== undefined) this.position = params.position;
  }
}
