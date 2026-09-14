import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminDashboardController } from '@/modules/analytics/presentation/admin-dashboard.controller';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [AdminDashboardController],
})
export class AdminDashboardModule {}
