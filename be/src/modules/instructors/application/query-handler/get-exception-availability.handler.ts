import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetExceptionAvailabilityQuery } from '../query/get-exception-availability.query';
import { TeacherAvailabilityExceptionRepository } from '@/modules/instructors/infrastructure/repository/teacher-availability-exception.repository';

@QueryHandler(GetExceptionAvailabilityQuery)
export class GetExceptionAvailabilityHandler
  implements IQueryHandler<GetExceptionAvailabilityQuery>
{
  constructor(private readonly repo: TeacherAvailabilityExceptionRepository) {}

  async execute(query: GetExceptionAvailabilityQuery) {
    return this.repo.findByInstructor(query.instructorId);
  }
}
