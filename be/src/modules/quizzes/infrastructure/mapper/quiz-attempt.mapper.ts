import { QuizAttempt } from '../../domain/entity/quiz-attempt.entity';
import { QuizAttemptOrmEntity } from '../entity/quiz-attempt.orm-entity';
export class QuizAttemptMapper {
  static toDomain(entity: QuizAttemptOrmEntity): QuizAttempt {
    return QuizAttempt.restore({
      id: Number(entity.id),
      quizId: Number(entity.quizId),
      userId: Number(entity.userId),
      score: entity.score,
      correctCount: entity.correctCount,
      totalQuestions: entity.totalQuestions,
      status: entity.status,
      startedAt: entity.startedAt,
      submittedAt: entity.submittedAt,
      createdAt: entity.createdAt,
    });
  }
}
