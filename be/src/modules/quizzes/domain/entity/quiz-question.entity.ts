import { QuizQuestionType } from '../enums/quiz-question-type.enum';
export class QuizQuestion {
  private constructor(
    public id: number | null,
    public quizId: number,
    public question: string,
    public type: QuizQuestionType,
    public audioUrl: string | null,
    public imageUrl: string | null,
    public explanation: string | null,
    public points: number,
    public position: number,
    public createdAt: Date | null,
  ) {}

  static restore(params: {
    id: number;
    quizId: number;
    question: string;
    type: QuizQuestionType;
    audioUrl: string | null;
    imageUrl: string | null;
    explanation: string | null;
    points: number;
    position: number;
    createdAt: Date | null;
  }): QuizQuestion {
    return new QuizQuestion(
      params.id, params.quizId, params.question, params.type,
      params.audioUrl, params.imageUrl, params.explanation,
      params.points, params.position, params.createdAt
    );
  }
}
