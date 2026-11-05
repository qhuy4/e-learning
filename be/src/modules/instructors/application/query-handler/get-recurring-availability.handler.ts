import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRecurringAvailabilityQuery } from '../query/get-recurring-availability.query';
import { InstructorAvailabilityRecurringRepository } from '@/modules/instructors/infrastructure/repository/instructor-availability-recurring.repository';

@QueryHandler(GetRecurringAvailabilityQuery)
export class GetRecurringAvailabilityHandler
  implements IQueryHandler<GetRecurringAvailabilityQuery>
{
  constructor(private readonly repo: InstructorAvailabilityRecurringRepository) {}

  async execute(query: GetRecurringAvailabilityQuery) {
    return this.repo.findByInstructor(query.instructorId);
  }
}
