import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { HttpStatus } from '@nestjs/common';
import { DeleteRecurringAvailabilityCommand } from '../command/delete-recurring-availability.command';
import { InstructorAvailabilityRecurringRepository } from '@/modules/instructors/infrastructure/repository/instructor-availability-recurring.repository';

@CommandHandler(DeleteRecurringAvailabilityCommand)
export class DeleteRecurringAvailabilityHandler
  implements ICommandHandler<DeleteRecurringAvailabilityCommand>
{
  constructor(private readonly repo: InstructorAvailabilityRecurringRepository) {}

  async execute(command: DeleteRecurringAvailabilityCommand) {
    const existing = await this.repo.findById(command.id);
    if (!existing || existing.instructor_id !== command.instructorId) {
      throw new AppException(ErrorCode.INVALID_PERMISSION, HttpStatus.FORBIDDEN);
    }
    return this.repo.delete(command.id);
  }
}
