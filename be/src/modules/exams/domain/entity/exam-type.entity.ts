export class ExamType {
  private constructor(
    public id: number | null,
    public name: string,
    public description: string | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    /** Soft delete — null = còn hiệu lực; có giá trị = đã xóa mềm. */
    public deletedAt: Date | null,
  ) {}

  static create(params: {
    name: string;
    description?: string | null;
  }): ExamType {
    return new ExamType(
      null,
      params.name,
      params.description ?? null,
      null,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    name: string;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt?: Date | null;
  }): ExamType {
    return new ExamType(
      params.id,
      params.name,
      params.description,
      params.createdAt,
      params.updatedAt,
      params.deletedAt ?? null,
    );
  }

  update(params: Partial<Pick<ExamType, 'name' | 'description'>>) {
    if (params.name !== undefined) this.name = params.name;
    if (params.description !== undefined) this.description = params.description;
  }
}
