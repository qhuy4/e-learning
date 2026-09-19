import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { SubmitExamAttemptCommand } from '../command/submit-exam-attempt.command';
import {
  IExamAttemptRepository,
  EXAM_ATTEMPT_REPOSITORY,
} from '../../domain/repository/exam-attempt.repository';
import {
  IExamAnswerRepository,
  EXAM_ANSWER_REPOSITORY,
} from '../../domain/repository/exam-answer.repository';
import {
  IExamQuestionRepository,
  EXAM_QUESTION_REPOSITORY,
} from '../../domain/repository/exam-question.repository';
import {
  IExamOptionRepository,
  EXAM_OPTION_REPOSITORY,
} from '../../domain/repository/exam-option.repository';
import { ExamAnswer } from '../../domain/entity/exam-answer.entity';
import { ExamAttemptStatus } from '../../domain/enums/exam-attempt-status.enum';

@CommandHandler(SubmitExamAttemptCommand)
export class SubmitExamAttemptHandler
  implements ICommandHandler<SubmitExamAttemptCommand>
{
  constructor(
    @Inject(EXAM_ATTEMPT_REPOSITORY)
    private readonly examAttemptRepo: IExamAttemptRepository,
    @Inject(EXAM_ANSWER_REPOSITORY)
    private readonly examAnswerRepo: IExamAnswerRepository,
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly examQuestionRepo: IExamQuestionRepository,
    @Inject(EXAM_OPTION_REPOSITORY)
    private readonly examOptionRepo: IExamOptionRepository,
  ) {}

  async execute(command: SubmitExamAttemptCommand) {
    const attempt = await this.examAttemptRepo.findById(
      command.dto.attemptId,
    );
    if (!attempt) {
      throw new NotFoundException('ExamAttempt not found');
    }
    if (attempt.status !== ExamAttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('ExamAttempt is not in progress');
    }

    const answerEntities: ExamAnswer[] = [];
    let correctCount = 0;
    let totalScore = 0;

    for (const ans of command.dto.answers) {
      const question = await this.examQuestionRepo.findById(ans.questionId);
      if (!question) continue;

      let isCorrect = false;

      if (ans.selectedOptionId !== undefined) {
        const options = await this.examOptionRepo.findByQuestionId(
          ans.questionId,
        );
        const selectedOption = options.find(
          (o) => o.id === ans.selectedOptionId,
        );
        if (selectedOption) {
          isCorrect = selectedOption.isCorrect;
        }
      }

      const earnedPoints = isCorrect ? question.points : 0;
      if (isCorrect) {
        correctCount++;
        totalScore += earnedPoints;
      }

      const answer = ExamAnswer.create({
        attemptId: attempt.id!,
        questionId: ans.questionId,
        selectedOptionId: ans.selectedOptionId,
        answerText: ans.answerText,
        isCorrect,
        earnedPoints,
      });
      answerEntities.push(answer);
    }

    await this.examAnswerRepo.saveAll(answerEntities);

    attempt.update({
      status: ExamAttemptStatus.SUBMITTED,
      submittedAt: new Date(),
      score: totalScore,
      correctCount,
    });

    return this.examAttemptRepo.update(attempt);
  }
}
