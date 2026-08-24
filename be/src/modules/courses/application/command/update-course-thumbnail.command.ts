export class UpdateCourseThumbnailCommand {
  constructor(
    public readonly courseId: number,

    public readonly key: string,
  ) {}
}
