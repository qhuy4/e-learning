export class ExamFormat {
  private constructor(
    public id: number | null,
    public examTypeId: number,
    public name: string,
    public version: number,
    public description: string | null,
    public durationSeconds: number | null,
    public isActive: boolean,
    public effectiveFrom: Date | null,
    public effectiveTo: Date | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    /** Soft delete — null = còn hiệu lực; có giá trị = đã xóa mềm. */
    public deletedAt: Date | null,
  ) {}

  static create(params: {
    examTypeId: number;
    name: string;
    version?: number;
    description?: string | null;
    durationSeconds?: number | null;
    isActive?: boolean;
    effectiveFrom?: Date | null;
    effectiveTo?: Date | null;
  }): ExamFormat {
    return new ExamFormat(
      null,
      params.examTypeId,
      params.name,
      params.version ?? 1,
      params.description ?? null,
      params.durationSeconds ?? null,
      params.isActive ?? true,
      params.effectiveFrom ?? null,
      params.effectiveTo ?? null,
      null,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    examTypeId: number;
    name: string;
    version: number;
    description: string | null;
    durationSeconds: number | null;
    isActive: boolean;
    effectiveFrom: Date | null;
    effectiveTo: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt?: Date | null;
  }): ExamFormat {
    return new ExamFormat(
      params.id,
      params.examTypeId,
      params.name,
      params.version,
      params.description,
      params.durationSeconds,
      params.isActive,
      params.effectiveFrom,
      params.effectiveTo,
      params.createdAt,
      params.updatedAt,
      params.deletedAt ?? null,
    );
  }

  update(params: Partial<Pick<ExamFormat, 'name' | 'version' | 'description' | 'durationSeconds' | 'isActive' | 'effectiveFrom' | 'effectiveTo'>>) {
    if (params.name !== undefined) this.name = params.name;
    if (params.version !== undefined) this.version = params.version;
    if (params.description !== undefined) this.description = params.description;
    if (params.durationSeconds !== undefined) this.durationSeconds = params.durationSeconds;
    if (params.isActive !== undefined) this.isActive = params.isActive;
    if (params.effectiveFrom !== undefined) this.effectiveFrom = params.effectiveFrom;
    if (params.effectiveTo !== undefined) this.effectiveTo = params.effectiveTo;
  }
}
