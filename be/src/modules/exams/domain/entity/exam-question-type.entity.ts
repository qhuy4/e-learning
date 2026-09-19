export class ExamQuestionType {
  private constructor(
    public id: number | null,
    public code: string,
    public name: string,
    public description: string | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    code: string;
    name: string;
    description?: string | null;
  }): ExamQuestionType {
    return new ExamQuestionType(
      null,
      params.code,
      params.name,
      params.description ?? null,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): ExamQuestionType {
    return new ExamQuestionType(
      params.id,
      params.code,
      params.name,
      params.description,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: Partial<Pick<ExamQuestionType, 'code' | 'name' | 'description'>>) {
    if (params.code !== undefined) this.code = params.code;
    if (params.name !== undefined) this.name = params.name;
    if (params.description !== undefined) this.description = params.description;
  }
}
