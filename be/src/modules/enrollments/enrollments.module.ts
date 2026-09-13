import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { EnrollmentRepository } from '@/modules/enrollments/infrastructure/repository/enrollment.repository';
import { ENROLLMENT_REPOSITORY } from '@/modules/enrollments/domain/repository/enrollment.repository';
import { StorageModule } from '@/common/storage/storage.module';

import { AdminEnrollmentsController } from '@/modules/enrollments/presentation/admin-enrollments.controller';
import { StudentEnrollmentsController } from '@/modules/enrollments/presentation/student-enrollments.controller';

import { GetAdminEnrollmentsHandler } from '@/modules/enrollments/application/query-handler/get-admin-enrollments.handler';
import { GetAdminEnrollmentByIdHandler } from '@/modules/enrollments/application/query-handler/get-admin-enrollment-by-id.handler';
import { GetMyEnrollmentsHandler } from '@/modules/enrollments/application/query-handler/get-my-enrollments.handler';
import { CheckEnrollmentHandler } from '@/modules/enrollments/application/query-handler/check-enrollment.handler';
import { CreateEnrollmentHandler } from '@/modules/enrollments/application/command-handler/create-enrollment.handler';

@Module({
  imports: [TypeOrmModule.forFeature([EnrollmentOrmEntity]), CqrsModule, StorageModule],
  controllers: [AdminEnrollmentsController, StudentEnrollmentsController],
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
    GetMyEnrollmentsHandler,
    CheckEnrollmentHandler,
    CreateEnrollmentHandler,
    GetInstructorEnrollmentsHandler,
  ],
  exports: [ENROLLMENT_REPOSITORY],
})
export class EnrollmentsModule {}
