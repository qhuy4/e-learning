import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { BookingOrmEntity } from './infrastructure/entity/booking.orm-entity';
import { MeetingRoomOrmEntity } from './infrastructure/entity/meeting-room.orm-entity';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { BookingRepository } from './infrastructure/repository/booking.repository';
import { AdminBookingsController } from './presentation/admin-bookings.controller';
import { InstructorBookingsController } from './presentation/instructor-bookings.controller';
import {
  BookingPaymentCallbackController,
  StudentBookingsController,
} from './presentation/student-bookings.controller';
import { CreateBookingHandler } from './application/command-handler/create-booking.handler';
import { UpdateBookingStatusHandler } from './application/command-handler/update-booking-status.handler';
import { DeleteBookingHandler } from './application/command-handler/delete-booking.handler';
import { GetBookingsHandler } from './application/query-handler/get-bookings.handler';
import { GetBookingByIdHandler } from './application/query-handler/get-booking-by-id.handler';
import { GetAvailableTeachersHandler } from '@/modules/bookings/application/query-handler/get-available-teachers.handler';
import { GetInstructorSlotsHandler } from '@/modules/bookings/application/query-handler/get-instructor-slots.handler';
import { GetInstructorWindowHandler } from '@/modules/bookings/application/query-handler/get-instructor-window.handler';
import { AvailabilityRepository } from '@/modules/bookings/infrastructure/repository/availability.repository';
import { MeetingRoomRepositoryImpl } from '@/modules/meeting-room/infrastructure/repository/meeting-room.repository';
import { AvailabilityController } from '@/modules/bookings/presentation/availability.controller';
import { InstructorAvailabilityRecurringOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-availability-recurring.orm.entity';
import { InstructorAvailabilityExceptionOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-availability-exception.orm.entity';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { BookingPaymentOrmEntity } from './infrastructure/entity/booking-payment.orm-entity';
import { BookingCheckoutService } from './application/booking-checkout.service';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { CouponsModule } from '@/modules/coupons/coupons.module';
import { AuthModule } from '@/modules/auth/auth.module';

const QueryHandlers = [
  GetBookingsHandler,
  GetBookingByIdHandler,
  GetAvailableTeachersHandler,
  GetInstructorSlotsHandler,
  GetInstructorWindowHandler,
];
const CommandHandlers = [
  CreateBookingHandler,
  UpdateBookingStatusHandler,
  DeleteBookingHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingOrmEntity,
      MeetingRoomOrmEntity,
      UserOrmEntity,
      InstructorAvailabilityRecurringOrmEntity,
      InstructorAvailabilityExceptionOrmEntity,
      InstructorProfileTypeOrmEntity,
      BookingPaymentOrmEntity,
    ]),
    CqrsModule,
    PaymentsModule,
    CouponsModule,
    AuthModule,
  ],
  controllers: [
    AdminBookingsController,
    InstructorBookingsController,
    StudentBookingsController,
    BookingPaymentCallbackController,
    AvailabilityController,
  ],
  providers: [
    BookingRepository,
    AvailabilityRepository,
    MeetingRoomRepositoryImpl,
    BookingCheckoutService,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [BookingRepository, AvailabilityRepository],
})
export class BookingsModule {}
