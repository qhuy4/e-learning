import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateQuestionStatusCommand } from '@/modules/course-questions/application/command/update-question-status.command';
import {
  ICourseQuestionRepository,
  COURSE_QUESTION_REPOSITORY,
} from '@/modules/course-questions/domain/repository/course-question.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(UpdateQuestionStatusCommand)
export class UpdateQuestionStatusHandler implements ICommandHandler<UpdateQuestionStatusCommand> {
  constructor(
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly questionRepository: ICourseQuestionRepository,
  ) {}

  async execute(command: UpdateQuestionStatusCommand) {
    const existing = await this.questionRepository.findById(command.data.id);
    if (!existing) {
      throw new AppException(ErrorCode.COURSE_QUESTION_NOT_FOUND, 404);
    }
    return this.questionRepository.updateStatus(command.data.id, command.data.status);
  }
}
