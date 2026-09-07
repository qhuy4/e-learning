import { Module } from '@nestjs/common';
import { UsersController } from '@/modules/users/presentation/user.controller';
import { InstructorProfileController } from '@/modules/users/presentation/instructor-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { UserProfileOrmEntity } from '@/modules/users/infrastructure/entity/user-profile.orm.entity';
import { UserProfileRepository } from '@/modules/users/infrastructure/repository/user-profile.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { GetUsersHandler } from '@/modules/users/application/query-handler/get-users.handler';
import { GetUserByIdHandler } from '@/modules/users/application/query-handler/get-user-by-id.handler';
import { GetMyProfileHandler } from '@/modules/users/application/query-handler/get-my-profile.handler';
import { GetInstructorProfileHandler } from '@/modules/users/application/query-handler/get-instructor-profile.handler';
import { ServiceModule } from '@/common/service/service.module';
import { CreateUserHandler } from '@/modules/users/application/command-handler/create-user.handler';
import { UpdateUserHandler } from '@/modules/users/application/command-handler/update-user.handler';
import { UpdateInstructorProfileHandler } from '@/modules/users/application/command-handler/update-instructor-profile.handler';
import { DeleteUserHandler } from '@/modules/users/application/command-handler/delete-user.handler';
import { BlockUserCommandHandler } from '@/modules/users/application/command-handler/block-user.handler';
import { UnBlockUserCommandHandler } from '@/modules/users/application/command-handler/unblock-user.handler';

const QueryHandlers = [GetUsersHandler, GetUserByIdHandler, GetMyProfileHandler, GetInstructorProfileHandler];
const CommandHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
  UpdateInstructorProfileHandler,
  DeleteUserHandler,
  BlockUserCommandHandler,
  UnBlockUserCommandHandler,
];

@Module({
  imports: [
    CqrsModule,
    ServiceModule,
    TypeOrmModule.forFeature([UserOrmEntity, UserProfileOrmEntity]),
  ],
  controllers: [UsersController, InstructorProfileController],
  providers: [
    UserRepository,
    UserProfileRepository,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [UserRepository, UserProfileRepository],
})
export class UserModule {}
