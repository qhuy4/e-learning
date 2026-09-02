import { Module } from '@nestjs/common';
import { UsersController } from './presentation/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { UserProfileOrmEntity } from '@/modules/users/infrastructure/entity/user-profile.orm.entity';
import { UserProfileRepository } from '@/modules/users/infrastructure/repository/user-profile.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { GetUsersHandler } from '@/modules/users/application/query-handler/get-users.handler';
import { GetUserByIdHandler } from '@/modules/users/application/query-handler/get-user-by-id.handler';
import { ServiceModule } from '@/common/service/service.module';
import { CreateUserHandler } from '@/modules/users/application/command-handler/create-user.handler';
import { UpdateUserHandler } from '@/modules/users/application/command-handler/update-user.handler';
import { DeleteUserHandler } from '@/modules/users/application/command-handler/delete-user.handler';
import { BlockUserCommandHandler } from '@/modules/users/application/command-handler/block-user.handler';
import { UnBlockUserCommandHandler } from '@/modules/users/application/command-handler/unblock-user.handler';

const QueryHandlers = [GetUsersHandler, GetUserByIdHandler];
const CommandHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
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
  controllers: [UsersController],
  providers: [
    UserRepository,
    UserProfileRepository,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [UserRepository, UserProfileRepository],
})
export class UserModule {}
