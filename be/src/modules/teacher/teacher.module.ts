import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterTeacherHandler } from '@/modules/teacher/application/command-handler/register-teacher.handler';
import { GetTeacherRegistrationStatusHandler } from '@/modules/teacher/application/query-handler/get-teacher-registration-status.handler';
import { InstructorCertificateEntity } from '@/modules/teacher/infrastructure/entity/instructor-certificate.entity';
import { InstructorKycEntity } from '@/modules/teacher/infrastructure/entity/instructor-kyc.entity';
import { InstructorProfileEntity } from '@/modules/teacher/infrastructure/entity/instructor-profile.entity';
import { FptEkycConfig } from '@/modules/teacher/infrastructure/integration/fpt-ekyc/fpt-ekyc.config';
import { FptEkycService } from '@/modules/teacher/infrastructure/integration/fpt-ekyc/fpt-ekyc.service';
import { InstructorCertificateRepository } from '@/modules/teacher/infrastructure/repository/instructor-certificate.repository';
import { InstructorKycRepository } from '@/modules/teacher/infrastructure/repository/instructor-kyc.repository';
import { InstructorProfileRepository } from '@/modules/teacher/infrastructure/repository/instructor-profile.repository';
import { TeacherController } from '@/modules/teacher/presentation/controller/teacher.controller';
import { AdminTeacherController } from '@/modules/teacher/presentation/controller/admin-teacher.controller';
// import { User } from '@/modules/users/domain/entity/user.entity'
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';

const commandHandlers = [RegisterTeacherHandler];
const queryHandlers = [GetTeacherRegistrationStatusHandler];
const repositories = [
  InstructorProfileRepository,
  InstructorKycRepository,
  InstructorCertificateRepository,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      InstructorProfileEntity,
      InstructorKycEntity,
      InstructorCertificateEntity,
      UserOrmEntity,
      // User,
    ]),
    HttpModule.register({
      timeout: 20000, // eKYC OCR/face-match có thể mất vài giây
    }),
  ],
  controllers: [TeacherController, AdminTeacherController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
    FptEkycConfig,
    FptEkycService,
  ],
  exports: [InstructorProfileRepository],
})
export class TeacherModule {}
