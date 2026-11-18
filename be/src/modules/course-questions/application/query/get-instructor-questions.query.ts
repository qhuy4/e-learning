export interface InstructorQuestionItem {
  id: number;
  courseId: number;
  userId: number;
  content: string;
  status: number;
  lastActivityAt: Date | null;
  createdAt: Date | null;
  course?: { id: number; title: string };
  user?: { id: number; name: string };
  answerCount: number;
}

export interface InstructorQuestionsPage {
  data: InstructorQuestionItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export class GetInstructorQuestionsQuery {
  constructor(
    public readonly instructorId: number,
    public readonly options: {
      page: number;
      limit: number;
      courseId?: number;
      status?: number;
      keyword?: string;
    },
  ) {}
}
