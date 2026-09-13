export class LessonProgress {
  constructor(
    public id: number,
    public userId: number,
    public courseId: number,
    public lessonId: number,

    public watchSeconds: number = 0,
    public progressPercent: number = 0,

    public isCompleted: boolean = false,
    public completedAt?: Date,

    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  markCompleted() {
    this.isCompleted = true;
    this.progressPercent = 100;
    this.completedAt = new Date();
  }

  updateProgress(watchedSeconds: number, percent: number) {
    this.watchSeconds = watchedSeconds;
    this.progressPercent = percent;

    if (percent >= 90 && !this.isCompleted) {
      this.markCompleted();
    }
  }
}
