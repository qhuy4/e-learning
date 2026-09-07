import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { CreateExceptionAvailabilityCommand } from '../command/create-exception-availability.command';
import { TeacherAvailabilityExceptionRepository } from '@/modules/instructors/infrastructure/repository/teacher-availability-exception.repository';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(CreateExceptionAvailabilityCommand)
export class CreateExceptionAvailabilityHandler
  implements ICommandHandler<CreateExceptionAvailabilityCommand>
{
  constructor(private readonly repo: TeacherAvailabilityExceptionRepository) {}

  async execute(command: CreateExceptionAvailabilityCommand) {
    const existing = await this.repo.findByDate(
      command.instructorId,
      command.data.specific_date,
    );

    if (existing) {
      throw new ConflictException(ErrorCode.AVAILABILITY_CONFLICT);
    }

    return this.repo.create({
      instructor_id: command.instructorId,
      ...command.data,
    });
  }
}
