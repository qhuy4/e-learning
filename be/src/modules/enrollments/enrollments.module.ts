import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { EnrollmentRepository } from '@/modules/enrollments/infrastructure/repository/enrollment.repository';
import { AdminEnrollmentsController } from '@/modules/enrollments/presentation/admin-enrollments.controller';
import { InstructorEnrollmentsController } from '@/modules/enrollments/presentation/instructor-enrollments.controller';
import { GetAdminEnrollmentsHandler } from '@/modules/enrollments/application/query-handler/get-admin-enrollments.handler';
import { GetAdminEnrollmentByIdHandler } from '@/modules/enrollments/application/query-handler/get-admin-enrollment-by-id.handler';
import { GetInstructorEnrollmentsHandler } from '@/modules/enrollments/application/query-handler/get-instructor-enrollments.handler';
import { ENROLLMENT_REPOSITORY } from '@/modules/enrollments/domain/repository/enrollment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EnrollmentOrmEntity]), CqrsModule],
  controllers: [AdminEnrollmentsController, InstructorEnrollmentsController],
  providers: [
    { provide: ENROLLMENT_REPOSITORY, useClass: EnrollmentRepository },
    GetAdminEnrollmentsHandler,
    GetAdminEnrollmentByIdHandler,
    GetInstructorEnrollmentsHandler,
  ],
})
export class EnrollmentsModule {}
