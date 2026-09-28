import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAvailableTeachersQuery } from '@/modules/bookings/application/query/get-available-teachers';
import { AvailabilityRepository } from '@/modules/bookings/infrastructure/repository/availability.repository';

@QueryHandler(GetAvailableTeachersQuery)
export class GetAvailableTeachersHandler implements IQueryHandler<GetAvailableTeachersQuery> {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
  ) {}

  async execute(query: GetAvailableTeachersQuery) {
    return this.availabilityRepository.findAvailableTeachers(query.data);
  }
}
