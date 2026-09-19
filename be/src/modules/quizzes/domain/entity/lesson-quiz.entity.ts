export class LessonQuiz {
  private constructor(
    public lessonId: number,
    public quizId: number,
  ) {}

  static create(params: { lessonId: number; quizId: number }): LessonQuiz {
    return new LessonQuiz(params.lessonId, params.quizId);
  }

  static restore(params: { lessonId: number; quizId: number }): LessonQuiz {
    return new LessonQuiz(params.lessonId, params.quizId);
  }
}
