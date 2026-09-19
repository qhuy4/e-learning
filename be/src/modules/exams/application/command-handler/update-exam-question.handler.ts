import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateExamQuestionCommand } from '../command/update-exam-question.command';
import {
  IExamQuestionRepository,
  EXAM_QUESTION_REPOSITORY,
} from '../../domain/repository/exam-question.repository';

@CommandHandler(UpdateExamQuestionCommand)
export class UpdateExamQuestionHandler
  implements ICommandHandler<UpdateExamQuestionCommand>
{
  constructor(
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly examQuestionRepo: IExamQuestionRepository,
  ) {}

  async execute(command: UpdateExamQuestionCommand) {
    const question = await this.examQuestionRepo.findById(command.id);
    if (!question) {
      throw new NotFoundException('ExamQuestion not found');
    }
    question.update({
      materialId: command.dto.materialId,
      questionTypeId: command.dto.questionTypeId,
      question: command.dto.question,
      explanation: command.dto.explanation,
      points: command.dto.points,
      position: command.dto.position,
    });
    return this.examQuestionRepo.save(question);
  }
}
