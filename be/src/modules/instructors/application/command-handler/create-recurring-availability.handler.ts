import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { CreateRecurringAvailabilityCommand } from '../command/create-recurring-availability.command';
import { InstructorAvailabilityRecurringRepository } from '@/modules/instructors/infrastructure/repository/instructor-availability-recurring.repository';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { AppException } from '@/common/exception/app.exception';

@CommandHandler(CreateRecurringAvailabilityCommand)
export class CreateRecurringAvailabilityHandler
  implements ICommandHandler<CreateRecurringAvailabilityCommand>
{
  constructor(private readonly repo: InstructorAvailabilityRecurringRepository) {}

  async execute(command: CreateRecurringAvailabilityCommand) {
    const existing = await this.repo.findOverlap(
      command.instructorId,
      command.data.day_of_week,
      command.data.start_time,
      command.data.end_time,
    );

    if (existing) {
      throw new AppException(
        ErrorCode.AVAILABILITY_CONFLICT,
        HttpStatus.CONFLICT,
      );
    }

    return this.repo.create({
      instructor_id: command.instructorId,
      ...command.data,
    });
  }
}
