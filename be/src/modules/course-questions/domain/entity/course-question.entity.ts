export class CourseQuestion {
  private constructor(
    public readonly id: number,
    public readonly courseId: number,
    public readonly userId: number,
    public readonly content: string,
    public readonly status: number,
    public readonly lastActivityAt: Date | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public readonly course?: any,
    public readonly user?: any,
    public readonly answers?: any[],
    public readonly answerCount?: number,
  ) {}

  static restore(params: {
    id: number;
    courseId: number;
    userId: number;
    content: string;
    status: number;
    lastActivityAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    course?: any;
    user?: any;
    answers?: any[];
    answerCount?: number;
  }): CourseQuestion {
    return new CourseQuestion(
      params.id,
      params.courseId,
      params.userId,
      params.content,
      params.status,
      params.lastActivityAt,
      params.createdAt,
      params.updatedAt,
      params.course,
      params.user,
      params.answers,
      params.answerCount,
    );
  }
}
