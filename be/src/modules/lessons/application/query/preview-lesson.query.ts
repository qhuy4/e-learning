export class PreviewLessonQuery {
  constructor(
    public readonly token: string,
    public readonly lessonId?: number,
    public readonly lessonSlug?: string,
  ) {}
}
