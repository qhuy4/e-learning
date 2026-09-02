import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterTeacherHandler } from './application/command-handler/register-teacher.handler';
import { GetTeacherRegistrationStatusHandler } from './application/query-handler/get-teacher-registration-status.handler';
import { InstructorCertificateEntity } from './infrastructure/entity/instructor-certificate.entity';
import { InstructorKycEntity } from './infrastructure/entity/instructor-kyc.entity';
import { InstructorProfileEntity } from './infrastructure/entity/instructor-profile.entity';
import { FptEkycConfig } from './infrastructure/integration/fpt-ekyc/fpt-ekyc.config';
import { FptEkycService } from './infrastructure/integration/fpt-ekyc/fpt-ekyc.service';
import { InstructorCertificateRepository } from './infrastructure/repository/instructor-certificate.repository';
import { InstructorKycRepository } from './infrastructure/repository/instructor-kyc.repository';
import { InstructorProfileRepository } from './infrastructure/repository/instructor-profile.repository';
import { TeacherController } from './presentation/controller/teacher.controller';
import { AdminTeacherController } from './presentation/controller/admin-teacher.controller';
// import { User } from '../users/domain/entity/user.entity'
import { UserOrmEntity } from '../users/infrastructure/entity/user.orm.entity';

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
