import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteDictationCommand } from '../command/delete-dictation.command';
import { Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IDictationRepository, DICTATION_REPOSITORY } from '../../domain/repository/dictation.repository';

@CommandHandler(DeleteDictationCommand)
export class DeleteDictationHandler implements ICommandHandler<DeleteDictationCommand> {
  constructor(@Inject(DICTATION_REPOSITORY) private dictRepo: IDictationRepository) {}
  async execute(command: DeleteDictationCommand) {
    const dict = await this.dictRepo.findById(Number(command.id));
    if (!dict) throw new NotFoundException();
    if (dict.createdBy !== command.userId) throw new UnauthorizedException();
    await this.dictRepo.delete(Number(command.id));
    return { success: true };
  }
}
