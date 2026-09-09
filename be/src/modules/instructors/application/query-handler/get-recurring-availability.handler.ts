import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRecurringAvailabilityQuery } from '../query/get-recurring-availability.query';
import { TeacherAvailabilityRecurringRepository } from '@/modules/instructors/infrastructure/repository/teacher-availability-recurring.repository';

@QueryHandler(GetRecurringAvailabilityQuery)
export class GetRecurringAvailabilityHandler
  implements IQueryHandler<GetRecurringAvailabilityQuery>
{
  constructor(private readonly repo: TeacherAvailabilityRecurringRepository) {}

  async execute(query: GetRecurringAvailabilityQuery) {
    return this.repo.findByInstructor(query.instructorId);
  }
}
