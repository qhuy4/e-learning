export class GetLessonBySlugQuery {
  constructor(
    public readonly slug: string,
    public readonly userId?: number,
  ) {}
}
