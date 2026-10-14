import { QuestionType } from '../enums/question-type.enum';

export class ExamQuestion {
  private constructor(
    public id: number | null,
    public sectionId: number,
    public groupId: number | null,
    public type: QuestionType,
    public question: string,
    public explanation: string | null,
    public points: number,
    public position: number,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    sectionId: number;
    groupId?: number | null;
    type: QuestionType;
    question: string;
    explanation?: string | null;
    points?: number;
    position: number;
  }): ExamQuestion {
    return new ExamQuestion(
      null,
      params.sectionId,
      params.groupId ?? null,
      params.type,
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
    groupId: number | null;
    type: QuestionType;
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
      params.groupId,
      params.type,
      params.question,
      params.explanation,
      params.points,
      params.position,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: Partial<Pick<ExamQuestion, 'sectionId' | 'groupId' | 'type' | 'question' | 'explanation' | 'points' | 'position'>>) {
    if (params.sectionId !== undefined) this.sectionId = params.sectionId;
    if (params.groupId !== undefined) this.groupId = params.groupId;
    if (params.type !== undefined) this.type = params.type;
    if (params.question !== undefined) this.question = params.question;
    if (params.explanation !== undefined) this.explanation = params.explanation;
    if (params.points !== undefined) this.points = params.points;
    if (params.position !== undefined) this.position = params.position;
  }
}
