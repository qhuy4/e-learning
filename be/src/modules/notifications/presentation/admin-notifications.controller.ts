import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { NotificationRepository } from '@/modules/notifications/infrastructure/repository/notification.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard)
export class AdminNotificationsController {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('type') type?: string,
    @Query('isRead') isRead?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.notificationRepository.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      type,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      keyword,
    });
  }

  @Get('unread-count')
  async unreadCount() {
    return this.notificationRepository.countUnread();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new AppException(ErrorCode.NOTIFICATION_NOT_FOUND, 404);
    }
    return notification;
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    const result = await this.notificationRepository.markAsRead(id);
    if (!result) {
      throw new AppException(ErrorCode.NOTIFICATION_NOT_FOUND, 404);
    }
    return result;
  }

  @Patch('read-all')
  async markAllAsRead() {
    return this.notificationRepository.markAllAsRead();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.notificationRepository.remove(id);
    if (!result) {
      throw new AppException(ErrorCode.NOTIFICATION_NOT_FOUND, 404);
    }
    return result;
  }
}
