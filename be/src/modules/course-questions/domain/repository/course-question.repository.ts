export const COURSE_QUESTION_REPOSITORY = 'COURSE_QUESTION_REPOSITORY';

export interface ICourseQuestionRepository {
  findAll(options: {
    page: number;
    limit: number;
    courseId?: number;
    status?: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; meta: { page: number; limit: number; total: number; totalPages: number } }>;

  findById(id: number): Promise<any | null>;

  updateStatus(id: number, status: number): Promise<any>;

  delete(id: number): Promise<void>;

  updateAnswerStatus(id: number, status: number): Promise<any>;

  deleteAnswer(id: number): Promise<void>;
}
