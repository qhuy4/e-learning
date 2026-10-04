import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetInstructorSlotsQuery } from '@/modules/bookings/application/query/get-instructor-slots.query';
import { AvailabilityRepository } from '@/modules/bookings/infrastructure/repository/availability.repository';

@QueryHandler(GetInstructorSlotsQuery)
export class GetInstructorSlotsHandler
  implements IQueryHandler<GetInstructorSlotsQuery>
{
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
  ) {}

  async execute(query: GetInstructorSlotsQuery) {
    return this.availabilityRepository.findInstructorSlots(query.data);
  }
}
