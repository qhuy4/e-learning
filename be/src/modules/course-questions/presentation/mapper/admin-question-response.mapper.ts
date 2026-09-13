import { CourseQuestion } from '@/modules/course-questions/domain/entity/course-question.entity';

export class AdminQuestionResponseMapper {
  static toResponse(question: CourseQuestion) {
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
