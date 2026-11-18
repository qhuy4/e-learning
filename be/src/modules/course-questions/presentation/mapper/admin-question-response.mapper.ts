import {
  CourseQuestionAnswerRef,
  CourseQuestionCourseRef,
  CourseQuestionUserRef,
} from '@/modules/course-questions/domain/entity/course-question.entity';

/** Nguồn dữ liệu cho response — CourseQuestion (admin) hoặc item từ instructor list. */
export interface AdminQuestionResponseSource {
  id: number;
  content: string;
  status: number;
  lastActivityAt: Date | null;
  createdAt: Date | null;
  updatedAt?: Date | null;
  course?: CourseQuestionCourseRef;
  user?: CourseQuestionUserRef;
  answers?: CourseQuestionAnswerRef[];
  answerCount?: number;
}

export class AdminQuestionResponseMapper {
  static toResponse(question: AdminQuestionResponseSource) {
    return {
      id: question.id,
      content: question.content,
      status: question.status,
      lastActivityAt: question.lastActivityAt,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      course: question.course,
      user: question.user,
      answerCount: question.answerCount,
      answers: question.answers,
    };
  }
}
