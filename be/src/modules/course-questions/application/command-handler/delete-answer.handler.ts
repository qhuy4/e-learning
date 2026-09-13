import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteAnswerCommand } from '@/modules/course-questions/application/command/delete-answer.command';
import {
  ICourseQuestionRepository,
  COURSE_QUESTION_REPOSITORY,
} from '@/modules/course-questions/domain/repository/course-question.repository';

@CommandHandler(DeleteAnswerCommand)
export class DeleteAnswerHandler implements ICommandHandler<DeleteAnswerCommand> {
  constructor(
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly questionRepository: ICourseQuestionRepository,
  ) {}

  async execute(command: DeleteAnswerCommand) {
    await this.questionRepository.deleteAnswer(command.data.id);
  }
}
