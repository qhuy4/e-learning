export class GetAdminCategoriesQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      keyword?: string;
      parentId?: number | null;
      getAll?: boolean;
    },
  ) {}
}
