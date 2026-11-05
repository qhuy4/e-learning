export class LessonNote {
  constructor(
    public id: number,
    public userId: number,
    public lessonId: number,

    public noteTimeSeconds: number = 0,
    public content: string = '',

    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  updateContent(content: string) {
    this.content = content;
  }
}
