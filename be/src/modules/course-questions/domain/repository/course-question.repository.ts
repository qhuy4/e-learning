import { CourseQuestion } from '@/modules/course-questions/domain/entity/course-question.entity';
import { CourseQuestionAnswerOrmEntity } from '@/modules/course-questions/infrastructure/entity/course-question-answer.orm-entity';

export const COURSE_QUESTION_REPOSITORY = 'COURSE_QUESTION_REPOSITORY';

export interface AdminQuestionsPage {
  data: CourseQuestion[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ICourseQuestionRepository {
  findAll(options: {
    page: number;
    limit: number;
    courseId?: number;
    status?: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<AdminQuestionsPage>;

  findById(id: number): Promise<CourseQuestion | null>;

  updateStatus(id: number, status: number): Promise<CourseQuestion | null>;

  delete(id: number): Promise<void>;

  updateAnswerStatus(
    id: number,
    status: number,
  ): Promise<CourseQuestionAnswerOrmEntity | null>;

  deleteAnswer(id: number): Promise<void>;
}
