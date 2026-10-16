export class GetLessonBySlugQuery {
  constructor(
    public readonly slug: string,
    public readonly userId?: number,
    // Version/course khác nhau có thể trùng slug bài học → gói theo courseSlug đang mở
    public readonly courseSlug?: string,
  ) {}
}
