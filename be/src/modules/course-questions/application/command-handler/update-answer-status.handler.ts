import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateAnswerStatusCommand } from '@/modules/course-questions/application/command/update-answer-status.command';
import {
  ICourseQuestionRepository,
  COURSE_QUESTION_REPOSITORY,
} from '@/modules/course-questions/domain/repository/course-question.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(UpdateAnswerStatusCommand)
export class UpdateAnswerStatusHandler implements ICommandHandler<UpdateAnswerStatusCommand> {
  constructor(
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly questionRepository: ICourseQuestionRepository,
  ) {}

  async execute(command: UpdateAnswerStatusCommand) {
    return this.questionRepository.updateAnswerStatus(command.data.id, command.data.status);
  }
}
