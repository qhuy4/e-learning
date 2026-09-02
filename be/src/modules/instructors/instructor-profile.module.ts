import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { InstructorProfileController } from '@/modules/instructors/presentation/instructor-profile.controller';
import { InstructorProfileRepository } from '@/modules/instructors/infrastructure/repository/instructor-profile.repository';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { GetInstructorProfileHandler } from '@/modules/instructors/application/query-handler/get-instructor-profile.handler';
import { UserModule } from '@/modules/users/user.module';

const QueryHandlers = [GetInstructorProfileHandler];
const CommandHandlers = [];

@Module({
  imports: [
    CqrsModule,
    UserModule,
    TypeOrmModule.forFeature([InstructorProfileTypeOrmEntity]),
  ],
  controllers: [InstructorProfileController],
  providers: [
    InstructorProfileRepository,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [InstructorProfileRepository],
})
export class InstructorProfileModule {}
