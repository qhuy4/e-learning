import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterTeacherHandler } from '@/modules/teacher/application/command-handler/register-teacher.handler';
import { GetTeacherRegistrationStatusHandler } from '@/modules/teacher/application/query-handler/get-teacher-registration-status.handler';
import { InstructorCertificateEntity } from '@/modules/teacher/infrastructure/entity/instructor-certificate.entity';
import { InstructorProfileEntity } from '@/modules/teacher/infrastructure/entity/instructor-profile.entity';
import { InstructorCertificateRepository } from '@/modules/teacher/infrastructure/repository/instructor-certificate.repository';
import { InstructorProfileRepository } from '@/modules/teacher/infrastructure/repository/instructor-profile.repository';
import { TeacherController } from '@/modules/teacher/presentation/controller/teacher.controller';
import { AdminTeacherController } from '@/modules/teacher/presentation/controller/admin-teacher.controller';
// import { User } from '@/modules/users/domain/entity/user.entity'
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';

const commandHandlers = [RegisterTeacherHandler];
const queryHandlers = [GetTeacherRegistrationStatusHandler];
const repositories = [
  InstructorProfileRepository,
  InstructorCertificateRepository,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      InstructorProfileEntity,
      InstructorCertificateEntity,
      UserOrmEntity,
      // User,
    ]),
  ],
  controllers: [TeacherController, AdminTeacherController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
  ],
  exports: [InstructorProfileRepository],
})
export class TeacherModule {}
