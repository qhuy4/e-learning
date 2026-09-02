export class CreateSectionCommand {
  constructor(
    public readonly courseId: number,
    public readonly title: string,
    public readonly description?: string,
    public readonly position?: number,
    public readonly isActive?: boolean,
  ) {}
}
