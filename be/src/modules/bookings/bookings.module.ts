import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { BookingOrmEntity } from './infrastructure/entity/booking.orm-entity';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { BookingRepository } from './infrastructure/repository/booking.repository';
import { AdminBookingsController } from './presentation/admin-bookings.controller';
import { CreateBookingHandler } from './application/command-handler/create-booking.handler';
import { UpdateBookingStatusHandler } from './application/command-handler/update-booking-status.handler';
import { DeleteBookingHandler } from './application/command-handler/delete-booking.handler';
import { GetBookingsHandler } from './application/query-handler/get-bookings.handler';
import { GetBookingByIdHandler } from './application/query-handler/get-booking-by-id.handler';

const QueryHandlers = [GetBookingsHandler, GetBookingByIdHandler];
const CommandHandlers = [CreateBookingHandler, UpdateBookingStatusHandler, DeleteBookingHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingOrmEntity, UserOrmEntity]),
    CqrsModule,
  ],
  controllers: [AdminBookingsController],
  providers: [
    BookingRepository,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [BookingRepository],
})
export class BookingsModule {}
