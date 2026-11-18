/** Relation course được mapper nạp (`id` đã chuyển number). */
export interface CourseQuestionCourseRef {
  id: number;
  title: string;
}

/** Relation user được mapper nạp. */
export interface CourseQuestionUserRef {
  id: number;
  name: string;
}

/** Answer được mapper nạp (kèm user trả lời). */
export interface CourseQuestionAnswerRef {
  id: number;
  questionId: number;
  userId: number;
  content: string;
  status: number;
  createdAt: Date | null;
  user?: CourseQuestionUserRef;
}

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
    public readonly course?: CourseQuestionCourseRef,
    public readonly user?: CourseQuestionUserRef,
    public readonly answers?: CourseQuestionAnswerRef[],
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
    course?: CourseQuestionCourseRef;
    user?: CourseQuestionUserRef;
    answers?: CourseQuestionAnswerRef[];
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
