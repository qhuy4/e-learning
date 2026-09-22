import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { GetBookingByIdQuery } from '@/modules/bookings/application/query/get-booking-by-id.query';
import { BookingRepository } from '@/modules/bookings/infrastructure/repository/booking.repository';

@QueryHandler(GetBookingByIdQuery)
export class GetBookingByIdHandler implements IQueryHandler<GetBookingByIdQuery> {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(query: GetBookingByIdQuery) {
    const booking = await this.bookingRepository.findById(query.id);
    if (!booking) {
      throw new AppException(ErrorCode.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return booking;
  }
}
