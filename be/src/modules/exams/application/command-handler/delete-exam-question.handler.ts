import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteExamQuestionCommand } from '../command/delete-exam-question.command';
import {
  IExamQuestionRepository,
  EXAM_QUESTION_REPOSITORY,
} from '../../domain/repository/exam-question.repository';

@CommandHandler(DeleteExamQuestionCommand)
export class DeleteExamQuestionHandler
  implements ICommandHandler<DeleteExamQuestionCommand>
{
  constructor(
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly examQuestionRepo: IExamQuestionRepository,
  ) {}

  async execute(command: DeleteExamQuestionCommand) {
    const question = await this.examQuestionRepo.findById(command.id);
    if (!question) {
      throw new NotFoundException('ExamQuestion not found');
    }
    await this.examQuestionRepo.delete(command.id);
    return { success: true };
  }
}
