import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { StartExamAttemptCommand } from '../command/start-exam-attempt.command';
import {
  IExamRepository,
  EXAM_REPOSITORY,
} from '../../domain/repository/exam.repository';
import {
  IExamSectionRepository,
  EXAM_SECTION_REPOSITORY,
} from '../../domain/repository/exam-section.repository';
import {
  IExamQuestionRepository,
  EXAM_QUESTION_REPOSITORY,
} from '../../domain/repository/exam-question.repository';
import {
  IExamAttemptRepository,
  EXAM_ATTEMPT_REPOSITORY,
} from '../../domain/repository/exam-attempt.repository';
import { ExamAttempt } from '../../domain/entity/exam-attempt.entity';
import { ExamStatus } from '../../domain/enums/exam-status.enum';

@CommandHandler(StartExamAttemptCommand)
export class StartExamAttemptHandler
  implements ICommandHandler<StartExamAttemptCommand>
{
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
    @Inject(EXAM_SECTION_REPOSITORY)
    private readonly examSectionRepo: IExamSectionRepository,
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly examQuestionRepo: IExamQuestionRepository,
    @Inject(EXAM_ATTEMPT_REPOSITORY)
    private readonly examAttemptRepo: IExamAttemptRepository,
  ) {}

  async execute(command: StartExamAttemptCommand) {
    const exam = await this.examRepo.findById(command.dto.examId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    if (exam.status !== ExamStatus.PUBLISHED) {
      throw new BadRequestException('Exam is not published');
    }

    const sections = await this.examSectionRepo.findByExamId(
      command.dto.examId,
    );

    let totalQuestions = 0;
    for (const section of sections) {
      const questions = await this.examQuestionRepo.findBySectionId(
        section.id!,
      );
      totalQuestions += questions.length;
    }

    const attempt = ExamAttempt.create({
      examId: command.dto.examId,
      userId: command.dto.userId,
      totalQuestions,
    });

    return this.examAttemptRepo.create(attempt);
  }
}
