import { ExamAttempt } from '../../domain/entity/exam-attempt.entity';
import { ExamAttemptOrmEntity } from '../entity/exam-attempt.orm-entity';

export class ExamAttemptMapper {
  static toDomain(entity: ExamAttemptOrmEntity): ExamAttempt {
    return ExamAttempt.restore({
      id: Number(entity.id),
      examId: Number(entity.examId),
      userId: Number(entity.userId),
      score: Number(entity.score),
      correctCount: entity.correctCount,
      totalQuestions: entity.totalQuestions,
      status: entity.status,
      startedAt: entity.startedAt,
      submittedAt: entity.submittedAt,
      createdAt: entity.createdAt,
    });
  }
}
