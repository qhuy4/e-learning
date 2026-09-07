import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { HttpStatus } from '@nestjs/common';
import { UpdateRecurringAvailabilityCommand } from '../command/update-recurring-availability.command';
import { TeacherAvailabilityRecurringRepository } from '@/modules/instructors/infrastructure/repository/teacher-availability-recurring.repository';

@CommandHandler(UpdateRecurringAvailabilityCommand)
export class UpdateRecurringAvailabilityHandler
  implements ICommandHandler<UpdateRecurringAvailabilityCommand>
{
  constructor(private readonly repo: TeacherAvailabilityRecurringRepository) {}

  async execute(command: UpdateRecurringAvailabilityCommand) {
    const existing = await this.repo.findById(command.id);
    if (!existing || existing.instructor_id !== command.instructorId) {
      throw new AppException(ErrorCode.INVALID_PERMISSION, HttpStatus.FORBIDDEN);
    }

    const dayOfWeek = command.data.day_of_week ?? existing.day_of_week;
    const startTime = command.data.start_time ?? existing.start_time;
    const endTime = command.data.end_time ?? existing.end_time;

    const overlap = await this.repo.findOverlap(
      command.instructorId,
      dayOfWeek,
      startTime,
      endTime,
      command.id,
    );

    if (overlap) {
      throw new ConflictException(ErrorCode.AVAILABILITY_CONFLICT);
    }

    return this.repo.update(command.id, command.data);
  }
}
