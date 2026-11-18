export interface CourseQuestionItem {
  id: number;
  courseId: number;
  userId: number;
  content: string;
  status: number;
  lastActivityAt: Date | null;
  createdAt: Date | null;
  user?: { id: number; name: string };
  answerCount: number;
}

export interface CourseQuestionsPage {
  data: CourseQuestionItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export class GetCourseQuestionsQuery {
  constructor(
    public readonly courseId: number,
    public readonly options: {
      page: number;
      limit: number;
      status?: number;
    },
  ) {}
}
