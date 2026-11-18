import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartDictationCommand } from '../command/start-dictation.command';
import { Inject } from '@nestjs/common';
import {
  IDictationAttemptRepository,
  DICTATION_ATTEMPT_REPOSITORY,
} from '../../domain/repository/dictation-attempt.repository';

@CommandHandler(StartDictationCommand)
export class StartDictationHandler implements ICommandHandler<StartDictationCommand> {
  constructor(
    @Inject(DICTATION_ATTEMPT_REPOSITORY)
    private attemptRepo: IDictationAttemptRepository,
  ) {}
  async execute(command: StartDictationCommand) {
    const attempt = await this.attemptRepo.create({
      dictationId: command.dictationId,
      userId: command.userId,
      accuracy: 0,
    });
    return attempt;
  }
}
