import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetExceptionAvailabilityQuery } from '../query/get-exception-availability.query';
import { InstructorAvailabilityExceptionRepository } from '@/modules/instructors/infrastructure/repository/instructor-availability-exception.repository';

@QueryHandler(GetExceptionAvailabilityQuery)
export class GetExceptionAvailabilityHandler
  implements IQueryHandler<GetExceptionAvailabilityQuery>
{
  constructor(private readonly repo: InstructorAvailabilityExceptionRepository) {}

  async execute(query: GetExceptionAvailabilityQuery) {
    return this.repo.findByInstructor(query.instructorId);
  }
}
