import { Module } from '@nestjs/common';
import { UsersController } from './presentation/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';
import { UserOrmEntity } from '@/modules/users/domain/entity/user.orm-entity';
import { UserProfileOrmEntity } from '@/modules/users/domain/entity/user-profile.orm.entity';
import { UserProfileRepository } from '@/modules/users/infrastructure/repository/user-profile.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity, UserProfileOrmEntity])],
  controllers: [UsersController],
  providers: [UserRepository, UserProfileRepository],
  exports: [UserRepository, UserProfileRepository],
})
export class UserModule {}
