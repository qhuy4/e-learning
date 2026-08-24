export class UpdateCourseCommand {
  constructor(
    public readonly id: number,
    public readonly data: {
      title?: string;
      description?: string | null;
      thumbnail?: string | null;
      level?: number;
      price?: number;
      parentId?: number | null;
    },
  ) {}
}
