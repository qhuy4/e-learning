export class LessonComment {
  constructor(
    public id: number,
    public lessonId: number,
    public userId: number,

    public parentId: number | null = null,
    public content: string = '',

    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  updateContent(content: string) {
    this.content = content;
  }
}
