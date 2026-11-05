import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/modules/auth/auth.module';
import { ServiceModule } from '@/common/service/service.module';
import { StorageModule } from '@/common/storage/storage.module';
import { CertificateModule } from '@/modules/certificates/certificate.module';
import { SkillProfilingModule } from '@/modules/skill-profiling/skill-profiling.module';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { InstructorApplicationOrmEntity } from '@/modules/instructor-applications/infrastructure/entity/instructor-application.orm.entity';
import { InstructorApplicationCertificateOrmEntity } from '@/modules/instructor-applications/infrastructure/entity/instructor-application-certificate.orm.entity';
import { InstructorApplicationTokenOrmEntity } from '@/modules/instructor-applications/infrastructure/entity/instructor-application-token.orm.entity';
import { EmailOutboxOrmEntity } from '@/modules/instructor-applications/infrastructure/entity/email-outbox.orm.entity';
import { InstructorApplicationTokenService } from '@/modules/instructor-applications/application/services/instructor-application-token.service';
import { EmailOutboxService } from '@/modules/instructor-applications/application/services/email-outbox.service';
import { InstructorApplicationsService } from '@/modules/instructor-applications/application/services/instructor-applications.service';
import { EmailOutboxWorker } from '@/modules/instructor-applications/infrastructure/workers/email-outbox.worker';
import { InstructorApplicationsController } from '@/modules/instructor-applications/presentation/controllers/instructor-applications.controller';
import { AdminInstructorApplicationsController } from '@/modules/instructor-applications/presentation/controllers/admin-instructor-applications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstructorApplicationOrmEntity,
      InstructorApplicationCertificateOrmEntity,
      InstructorApplicationTokenOrmEntity,
      EmailOutboxOrmEntity,
      UserOrmEntity,
    ]),
    AuthModule,
    ServiceModule,
    StorageModule,
    CertificateModule,
    SkillProfilingModule,
  ],
  controllers: [
    InstructorApplicationsController,
    AdminInstructorApplicationsController,
  ],
  providers: [
    InstructorApplicationTokenService,
    EmailOutboxService,
    InstructorApplicationsService,
    EmailOutboxWorker,
  ],
  exports: [
    InstructorApplicationTokenService,
    EmailOutboxService,
    InstructorApplicationsService,
    TypeOrmModule,
  ],
})
export class InstructorApplicationsModule {}
