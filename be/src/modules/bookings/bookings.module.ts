import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { BookingOrmEntity } from './infrastructure/entity/booking.orm-entity';
import { MeetingRoomOrmEntity } from './infrastructure/entity/meeting-room.orm-entity';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { BookingRepository } from './infrastructure/repository/booking.repository';
import { AdminBookingsController } from './presentation/admin-bookings.controller';
import { InstructorBookingsController } from './presentation/instructor-bookings.controller';
import { StudentBookingsController } from './presentation/student-bookings.controller';
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
import {
  TeacherAvailabilityRecurringOrmEntity,
} from '@/modules/instructors/infrastructure/entity/teacher-availability-recurring.orm.entity';
import {
  TeacherAvailabilityExceptionOrmEntity,
} from '@/modules/instructors/infrastructure/entity/teacher-availability-exception.orm.entity';

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
      TeacherAvailabilityRecurringOrmEntity,
      TeacherAvailabilityExceptionOrmEntity,
    ]),
    CqrsModule,
  ],
  controllers: [
    AdminBookingsController,
    InstructorBookingsController,
    StudentBookingsController,
    AvailabilityController,
  ],
  providers: [
    BookingRepository,
    AvailabilityRepository,
    MeetingRoomRepositoryImpl,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [BookingRepository, AvailabilityRepository],
})
export class BookingsModule {}
