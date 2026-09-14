import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationOrmEntity } from '@/modules/notifications/infrastructure/entity/notification.orm-entity';
import { NotificationRepository } from '@/modules/notifications/infrastructure/repository/notification.repository';
import { AdminNotificationsController } from '@/modules/notifications/presentation/admin-notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationOrmEntity])],
  controllers: [AdminNotificationsController],
  providers: [NotificationRepository],
  exports: [NotificationRepository],
})
export class NotificationsModule {}
