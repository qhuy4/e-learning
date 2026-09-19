export class ExamFormat {
  private constructor(
    public id: number | null,
    public examTypeId: number,
    public code: string,
    public name: string,
    public version: number,
    public description: string | null,
    public durationSeconds: number,
    public isActive: boolean,
    public effectiveFrom: Date | null,
    public effectiveTo: Date | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    examTypeId: number;
    code: string;
    name: string;
    version?: number;
    description?: string | null;
    durationSeconds: number;
    isActive?: boolean;
    effectiveFrom?: Date | null;
    effectiveTo?: Date | null;
  }): ExamFormat {
    return new ExamFormat(
      null,
      params.examTypeId,
      params.code,
      params.name,
      params.version ?? 1,
      params.description ?? null,
      params.durationSeconds,
      params.isActive ?? true,
      params.effectiveFrom ?? null,
      params.effectiveTo ?? null,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    examTypeId: number;
    code: string;
    name: string;
    version: number;
    description: string | null;
    durationSeconds: number;
    isActive: boolean;
    effectiveFrom: Date | null;
    effectiveTo: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): ExamFormat {
    return new ExamFormat(
      params.id,
      params.examTypeId,
      params.code,
      params.name,
      params.version,
      params.description,
      params.durationSeconds,
      params.isActive,
      params.effectiveFrom,
      params.effectiveTo,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: Partial<Pick<ExamFormat, 'code' | 'name' | 'version' | 'description' | 'durationSeconds' | 'isActive' | 'effectiveFrom' | 'effectiveTo'>>) {
    if (params.code !== undefined) this.code = params.code;
    if (params.name !== undefined) this.name = params.name;
    if (params.version !== undefined) this.version = params.version;
    if (params.description !== undefined) this.description = params.description;
    if (params.durationSeconds !== undefined) this.durationSeconds = params.durationSeconds;
    if (params.isActive !== undefined) this.isActive = params.isActive;
    if (params.effectiveFrom !== undefined) this.effectiveFrom = params.effectiveFrom;
    if (params.effectiveTo !== undefined) this.effectiveTo = params.effectiveTo;
  }
}
