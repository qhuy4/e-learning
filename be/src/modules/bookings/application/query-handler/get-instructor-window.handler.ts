import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetInstructorWindowQuery } from '@/modules/bookings/application/query/get-instructor-window.query';
import { AvailabilityRepository } from '@/modules/bookings/infrastructure/repository/availability.repository';

@QueryHandler(GetInstructorWindowQuery)
export class GetInstructorWindowHandler
  implements IQueryHandler<GetInstructorWindowQuery>
{
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
  ) {}

  async execute(query: GetInstructorWindowQuery) {
    return this.availabilityRepository.findInstructorWindow(
      query.data.instructorId,
      query.data.bookingDate,
    );
  }
}
