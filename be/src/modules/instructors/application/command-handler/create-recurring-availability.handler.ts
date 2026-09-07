import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { CreateRecurringAvailabilityCommand } from '../command/create-recurring-availability.command';
import { TeacherAvailabilityRecurringRepository } from '@/modules/instructors/infrastructure/repository/teacher-availability-recurring.repository';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(CreateRecurringAvailabilityCommand)
export class CreateRecurringAvailabilityHandler
  implements ICommandHandler<CreateRecurringAvailabilityCommand>
{
  constructor(private readonly repo: TeacherAvailabilityRecurringRepository) {}

  async execute(command: CreateRecurringAvailabilityCommand) {
    const existing = await this.repo.findOverlap(
      command.instructorId,
      command.data.day_of_week,
      command.data.start_time,
      command.data.end_time,
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
