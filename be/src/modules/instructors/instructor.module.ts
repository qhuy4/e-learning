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
import { InstructorCertificateEntity } from '@/modules/teacher/infrastructure/entity/instructor-certificate.entity';
import { InstructorCertificateController } from '@/modules/instructors/presentation/instructor-certificate.controller';
import { GetInstructorCertificatesHandler } from '@/modules/instructors/application/query-handler/get-instructor-certificates.handler';
import { GetInstructorCertificateByIdHandler } from '@/modules/instructors/application/query-handler/get-instructor-certificate-by-id.handler';
import { CreateInstructorCertificateHandler } from '@/modules/instructors/application/command-handler/create-instructor-certificate.handler';
import { DeleteInstructorCertificateHandler } from '@/modules/instructors/application/command-handler/delete-instructor-certificate.handler';
import { InstructorAnalyticsController } from '@/modules/analytics/presentation/instructor-analytics.controller';
import { GetCourseAnalyticsHandler } from '@/modules/analytics/application/query-handler/get-course-analytics.handler';
import { CourseViewOrmEntity } from '@/modules/analytics/infrastructure/entity/course-view.orm-entity';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { LessonProgressOrmEntity } from '@/modules/lesson-progress/infrastructure/entity/lesson-progress.orm-entity';
import { ReviewOrmEntity } from '@/modules/reviews/infrastructure/entity/review.orm-entity';
import { SectionOrmEntity } from '@/modules/sections/infrastructure/entity/section.orm-entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';
import { OrderOrmEntity } from '@/modules/orders/infrastructure/entity/order.orm-entity';

const QueryHandlers = [
  GetInstructorProfileHandler,
  GetInstructorsHandler,
  GetInstructorByIdHandler,
  GetRecurringAvailabilityHandler,
  GetExceptionAvailabilityHandler,
  GetInstructorRevenueSummaryHandler,
  GetInstructorRevenueByCourseHandler,
  GetInstructorCertificatesHandler,
  GetInstructorCertificateByIdHandler,
  GetCourseAnalyticsHandler,
];
const CommandHandlers = [
  UpdateInstructorHandler,
  CreateRecurringAvailabilityHandler,
  UpdateRecurringAvailabilityHandler,
  DeleteRecurringAvailabilityHandler,
  CreateExceptionAvailabilityHandler,
  UpdateExceptionAvailabilityHandler,
  DeleteExceptionAvailabilityHandler,
  CreateInstructorCertificateHandler,
  DeleteInstructorCertificateHandler,
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
      InstructorCertificateEntity,
      CourseViewOrmEntity,
      EnrollmentOrmEntity,
      LessonProgressOrmEntity,
      ReviewOrmEntity,
      SectionOrmEntity,
      LessonOrmEntity,
      OrderOrmEntity,
    ]),
  ],
  controllers: [
    InstructorsController,
    InstructorRecurringAvailabilityController,
    InstructorExceptionAvailabilityController,
    InstructorRevenueController,
    InstructorCertificateController,
    InstructorAnalyticsController,
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
