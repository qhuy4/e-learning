import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubmitQuizCommand } from '../command/submit-quiz.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { IQuizAttemptRepository, QUIZ_ATTEMPT_REPOSITORY } from '../../domain/repository/quiz-attempt.repository';
import { IQuizQuestionRepository, QUIZ_QUESTION_REPOSITORY } from '../../domain/repository/quiz-question.repository';
import { IQuizOptionRepository, QUIZ_OPTION_REPOSITORY } from '../../domain/repository/quiz-option.repository';
import { IQuizAnswerRepository, QUIZ_ANSWER_REPOSITORY } from '../../domain/repository/quiz-answer.repository';
import { QuizAttemptStatus } from '../../domain/enums/quiz-attempt-status.enum';
import { QuizAnswer } from '../../domain/entity/quiz-answer.entity';
import { QuizQuestionType } from '../../domain/enums/quiz-question-type.enum';

@CommandHandler(SubmitQuizCommand)
export class SubmitQuizHandler implements ICommandHandler<SubmitQuizCommand> {
  constructor(
    @Inject(QUIZ_ATTEMPT_REPOSITORY) private attemptRepo: IQuizAttemptRepository,
    @Inject(QUIZ_QUESTION_REPOSITORY) private questionRepo: IQuizQuestionRepository,
    @Inject(QUIZ_OPTION_REPOSITORY) private optionRepo: IQuizOptionRepository,
    @Inject(QUIZ_ANSWER_REPOSITORY) private answerRepo: IQuizAnswerRepository,
  ) {}

  async execute(command: SubmitQuizCommand) {
    const attempt = await this.attemptRepo.findById(Number(command.attemptId));
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId.toString() !== command.userId) throw new Error('Unauthorized');
    if (attempt.status === QuizAttemptStatus.SUBMITTED) throw new Error('Quiz already submitted');

    const questions = await this.questionRepo.findByQuizId(attempt.quizId);
    const options = await this.optionRepo.findByQuestionIds(questions.map(q => q.id!));

    let correctCount = 0;
    let earnedScore = 0;
    const answersToSave: QuizAnswer[] = [];

    for (const q of questions) {
      const submittedAnswer = command.dto.answers.find(a => Number(a.questionId) === q.id);
      let isCorrect = false;
      let earnedPoints = 0;

      if (submittedAnswer) {
        if (q.type === QuizQuestionType.MULTIPLE_CHOICE || q.type === QuizQuestionType.TRUE_FALSE) {
          const correctOption = options.find(o => o.questionId === q.id && o.isCorrect);
          if (correctOption && submittedAnswer.selectedOptionId && Number(submittedAnswer.selectedOptionId) === correctOption.id) {
            isCorrect = true;
          }
        } else if (q.type === QuizQuestionType.FILL_BLANK) {
          const correctOption = options.find(o => o.questionId === q.id && o.isCorrect);
          if (correctOption && submittedAnswer.answerText && correctOption.content.toLowerCase() === submittedAnswer.answerText.toLowerCase()) {
            isCorrect = true;
          }
        }
      }

      if (isCorrect) {
        correctCount++;
        earnedPoints = q.points;
        earnedScore += q.points;
      }

      answersToSave.push(QuizAnswer.create({
        attemptId: attempt.id!,
        questionId: q.id!,
        selectedOptionId: submittedAnswer?.selectedOptionId ? Number(submittedAnswer.selectedOptionId) : null,
        answerText: submittedAnswer?.answerText || null,
        isCorrect,
        earnedPoints,
      }));
    }

    await this.answerRepo.saveAll(answersToSave);

    attempt.correctCount = correctCount;
    attempt.totalQuestions = questions.length;
    attempt.score = earnedScore; // Depending on requirements, this might be a percentage or raw points
    attempt.status = QuizAttemptStatus.SUBMITTED;
    attempt.submittedAt = new Date();

    return this.attemptRepo.update(attempt);
  }
}
