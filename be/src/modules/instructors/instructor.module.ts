import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { InstructorProfileRepository } from '@/modules/instructors/infrastructure/repository/instructor-profile.repository';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { GetInstructorProfileHandler } from '@/modules/instructors/application/query-handler/get-instructor-profile.handler';
import { UserModule } from '@/modules/users/user.module';
import { InstructorsController } from '@/modules/instructors/presentation/instructors.controller';
import { InstructorRepository } from '@/modules/instructors/infrastructure/repository/instructor.repository';
import { GetInstructorsHandler } from '@/modules/instructors/application/query-handler/get-instructors.handler';
import { GetInstructorByIdHandler } from '@/modules/instructors/application/query-handler/get-instructor-by-id.handler';
import { UpdateInstructorHandler } from '@/modules/instructors/application/command-handler/update-instructor.handler';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';

import { TeacherAvailabilityRecurringOrmEntity } from '@/modules/instructors/infrastructure/entity/teacher-availability-recurring.orm.entity';
import { TeacherAvailabilityExceptionOrmEntity } from '@/modules/instructors/infrastructure/entity/teacher-availability-exception.orm.entity';
import { TeacherAvailabilityRecurringRepository } from '@/modules/instructors/infrastructure/repository/teacher-availability-recurring.repository';
import { TeacherAvailabilityExceptionRepository } from '@/modules/instructors/infrastructure/repository/teacher-availability-exception.repository';
import { InstructorRecurringAvailabilityController } from '@/modules/instructors/presentation/instructor-recurring-availability.controller';
import { InstructorExceptionAvailabilityController } from '@/modules/instructors/presentation/instructor-exception-availability.controller';
import { GetRecurringAvailabilityHandler } from '@/modules/instructors/application/query-handler/get-recurring-availability.handler';
import { GetExceptionAvailabilityHandler } from '@/modules/instructors/application/query-handler/get-exception-availability.handler';
import { CreateRecurringAvailabilityHandler } from '@/modules/instructors/application/command-handler/create-recurring-availability.handler';
import { UpdateRecurringAvailabilityHandler } from '@/modules/instructors/application/command-handler/update-recurring-availability.handler';
import { DeleteRecurringAvailabilityHandler } from '@/modules/instructors/application/command-handler/delete-recurring-availability.handler';
import { CreateExceptionAvailabilityHandler } from '@/modules/instructors/application/command-handler/create-exception-availability.handler';
import { UpdateExceptionAvailabilityHandler } from '@/modules/instructors/application/command-handler/update-exception-availability.handler';
import { DeleteExceptionAvailabilityHandler } from '@/modules/instructors/application/command-handler/delete-exception-availability.handler';
import { InstructorRevenueController } from '@/modules/instructors/presentation/instructor-revenue.controller';
import { GetInstructorRevenueSummaryHandler } from '@/modules/instructors/application/query-handler/get-instructor-revenue-summary.handler';
import { GetInstructorRevenueByCourseHandler } from '@/modules/instructors/application/query-handler/get-instructor-revenue-by-course.handler';
import { OrderItemOrmEntity } from '@/modules/orders/infrastructure/entity/order-item.orm-entity';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';

const QueryHandlers = [
  GetInstructorProfileHandler,
  GetInstructorsHandler,
  GetInstructorByIdHandler,
  GetRecurringAvailabilityHandler,
  GetExceptionAvailabilityHandler,
  GetInstructorRevenueSummaryHandler,
  GetInstructorRevenueByCourseHandler,
];
const CommandHandlers = [
  UpdateInstructorHandler,
  CreateRecurringAvailabilityHandler,
  UpdateRecurringAvailabilityHandler,
  DeleteRecurringAvailabilityHandler,
  CreateExceptionAvailabilityHandler,
  UpdateExceptionAvailabilityHandler,
  DeleteExceptionAvailabilityHandler,
];

@Module({
  imports: [
    CqrsModule,
    UserModule,
    TypeOrmModule.forFeature([
      InstructorProfileTypeOrmEntity,
      UserOrmEntity,
      TeacherAvailabilityRecurringOrmEntity,
      TeacherAvailabilityExceptionOrmEntity,
      OrderItemOrmEntity,
      CourseOrmEntity,
    ]),
  ],
  controllers: [
    InstructorsController,
    InstructorRecurringAvailabilityController,
    InstructorExceptionAvailabilityController,
    InstructorRevenueController,
  ],
  providers: [
    InstructorProfileRepository,
    InstructorRepository,
    TeacherAvailabilityRecurringRepository,
    TeacherAvailabilityExceptionRepository,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [InstructorProfileRepository, InstructorRepository],
})
export class InstructorModule {}
