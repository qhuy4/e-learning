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

const QueryHandlers = [GetInstructorProfileHandler, GetInstructorsHandler, GetInstructorByIdHandler];
const CommandHandlers = [UpdateInstructorHandler];

@Module({
  imports: [
    CqrsModule,
    UserModule,
    TypeOrmModule.forFeature([InstructorProfileTypeOrmEntity, UserOrmEntity]),
  ],
  controllers: [InstructorsController],
  providers: [
    InstructorProfileRepository,
    InstructorRepository,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [InstructorProfileRepository, InstructorRepository],
})
export class InstructorModule {}
