export class CreateCourseThumbnailUploadCommand {
  constructor(
    public readonly courseId: number,

    public readonly fileName: string,

    public readonly contentType: string,
  ) {}
}
