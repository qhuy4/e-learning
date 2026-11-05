import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { HttpStatus } from '@nestjs/common';
import { DeleteExceptionAvailabilityCommand } from '../command/delete-exception-availability.command';
import { InstructorAvailabilityExceptionRepository } from '@/modules/instructors/infrastructure/repository/instructor-availability-exception.repository';

@CommandHandler(DeleteExceptionAvailabilityCommand)
export class DeleteExceptionAvailabilityHandler
  implements ICommandHandler<DeleteExceptionAvailabilityCommand>
{
  constructor(private readonly repo: InstructorAvailabilityExceptionRepository) {}

  async execute(command: DeleteExceptionAvailabilityCommand) {
    const existing = await this.repo.findById(command.id);
    if (!existing || existing.instructor_id !== command.instructorId) {
      throw new AppException(ErrorCode.INVALID_PERMISSION, HttpStatus.FORBIDDEN);
    }
    return this.repo.delete(command.id);
  }
}
