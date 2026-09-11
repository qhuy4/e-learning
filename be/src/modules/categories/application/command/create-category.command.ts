export class CreateCategoryCommand {
  constructor(
    public readonly data: {
      name: string;
      slug: string;
      parentId?: number | null;
    },
  ) {}
}
