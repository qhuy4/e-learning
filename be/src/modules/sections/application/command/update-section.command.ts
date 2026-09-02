export class UpdateSectionCommand {
  constructor(
    public readonly id: number,
    public readonly data: {
      title?: string;
      description?: string | null;
      position?: number;
      isActive?: boolean;
    },
  ) {}
}
