import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetBookingsQuery } from '@/modules/bookings/application/query/get-bookings.query';
import { BookingRepository } from '@/modules/bookings/infrastructure/repository/booking.repository';

@QueryHandler(GetBookingsQuery)
export class GetBookingsHandler implements IQueryHandler<GetBookingsQuery> {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(query: GetBookingsQuery) {
    return this.bookingRepository.findAll({
      page: query.page,
      limit: query.limit,
      keyword: query.keyword,
      instructorId: query.instructorId,
      studentId: query.studentId,
      status: query.status,
      bookingDate: query.bookingDate,
    });
  }
}
