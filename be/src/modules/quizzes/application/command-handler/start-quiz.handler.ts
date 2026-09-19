import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartQuizCommand } from '../command/start-quiz.command';
import { Inject } from '@nestjs/common';
import { IQuizAttemptRepository, QUIZ_ATTEMPT_REPOSITORY } from '../../domain/repository/quiz-attempt.repository';
import { QuizAttempt } from '../../domain/entity/quiz-attempt.entity';

@CommandHandler(StartQuizCommand)
export class StartQuizHandler implements ICommandHandler<StartQuizCommand> {
  constructor(@Inject(QUIZ_ATTEMPT_REPOSITORY) private attemptRepo: IQuizAttemptRepository) {}
  async execute(command: StartQuizCommand) {
    const attempt = QuizAttempt.create({ quizId: Number(command.quizId), userId: Number(command.userId) });
    return this.attemptRepo.create(attempt);
  }
}
