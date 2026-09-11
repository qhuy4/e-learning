import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteQuestionCommand } from '@/modules/course-questions/application/command/delete-question.command';
import {
  ICourseQuestionRepository,
  COURSE_QUESTION_REPOSITORY,
} from '@/modules/course-questions/domain/repository/course-question.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionHandler implements ICommandHandler<DeleteQuestionCommand> {
  constructor(
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly questionRepository: ICourseQuestionRepository,
  ) {}

  async execute(command: DeleteQuestionCommand) {
    const existing = await this.questionRepository.findById(command.data.id);
    if (!existing) {
      throw new AppException(ErrorCode.COURSE_QUESTION_NOT_FOUND, 404);
    }
    await this.questionRepository.delete(command.data.id);
  }
}
