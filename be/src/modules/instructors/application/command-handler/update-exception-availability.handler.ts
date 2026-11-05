import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { HttpStatus } from '@nestjs/common';
import { UpdateExceptionAvailabilityCommand } from '../command/update-exception-availability.command';
import { InstructorAvailabilityExceptionRepository } from '@/modules/instructors/infrastructure/repository/instructor-availability-exception.repository';

@CommandHandler(UpdateExceptionAvailabilityCommand)
export class UpdateExceptionAvailabilityHandler implements ICommandHandler<UpdateExceptionAvailabilityCommand> {
  constructor(private readonly repo: InstructorAvailabilityExceptionRepository) {}

  async execute(command: UpdateExceptionAvailabilityCommand) {
    const existing = await this.repo.findById(command.id);
    if (!existing || existing.instructor_id !== command.instructorId) {
      throw new AppException(
        ErrorCode.INVALID_PERMISSION,
        HttpStatus.FORBIDDEN,
      );
    }

    const specificDate = command.data.specific_date ?? existing.specific_date;

    const overlap = await this.repo.findByDate(
      command.instructorId,
      specificDate,
      command.id,
    );

    if (overlap) {
      throw new AppException(
        ErrorCode.AVAILABILITY_CONFLICT,
        HttpStatus.CONFLICT,
      );
    }

    return this.repo.update(command.id, command.data);
  }
}
