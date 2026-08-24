export class CreateCourseCommand {
  constructor(
    public readonly instructorId: number,
    public readonly title: string,
    public readonly description?: string,
    public readonly thumbnail?: Express.Multer.File,
    public readonly level?: number,
    public readonly price?: number,
    public readonly parentId?: number,
  ) {}
}
