export class UpdateCategoryCommand {
  constructor(
    public readonly data: {
      id: number;
      name?: string;
      slug?: string;
      parentId?: number | null;
    },
  ) {}
}
