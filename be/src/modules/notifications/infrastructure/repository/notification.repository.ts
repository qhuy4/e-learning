import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { NotificationOrmEntity } from '@/modules/notifications/infrastructure/entity/notification.orm-entity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly repository: Repository<NotificationOrmEntity>,
  ) {}

  async findAll(options: {
    page: number;
    limit: number;
    type?: string;
    isRead?: boolean;
    keyword?: string;
  }) {
    const { page, limit, type, isRead, keyword } = options;

    const qb = this.repository
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.user', 'user');

    if (type) {
      qb.andWhere('n.type = :type', { type });
    }

    if (isRead !== undefined) {
      qb.andWhere('n.is_read = :isRead', { isRead });
    }

    if (keyword) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('n.title ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('n.body ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('n.type ILIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    qb.orderBy('n.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();

    const data = entities.map((e) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      body: e.body,
      data: e.data,
      notifiableType: e.notifiableType,
      notifiableId: Number(e.notifiableId),
      isRead: e.isRead,
      readAt: e.readAt,
      actionUrl: e.actionUrl,
      entityType: e.entityType,
      entityId: e.entityId ? Number(e.entityId) : null,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      user: e.user ? { id: Number(e.user.id), name: e.user.name } : undefined,
    }));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const entity = await this.repository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!entity) return null;
    return {
      id: entity.id,
      type: entity.type,
      title: entity.title,
      body: entity.body,
      data: entity.data,
      notifiableType: entity.notifiableType,
      notifiableId: Number(entity.notifiableId),
      isRead: entity.isRead,
      readAt: entity.readAt,
      actionUrl: entity.actionUrl,
      entityType: entity.entityType,
      entityId: entity.entityId ? Number(entity.entityId) : null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      user: entity.user ? { id: Number(entity.user.id), name: entity.user.name, email: entity.user.email } : undefined,
    };
  }

  async markAsRead(id: string) {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    entity.isRead = true;
    entity.readAt = new Date();
    await this.repository.save(entity);
    return { id: entity.id, isRead: entity.isRead, readAt: entity.readAt };
  }

  async markAllAsRead() {
    await this.repository
      .createQueryBuilder()
      .update()
      .set({ isRead: true, readAt: new Date() })
      .where('is_read = :isRead', { isRead: false })
      .execute();
    return { success: true };
  }

  async remove(id: string) {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    await this.repository.remove(entity);
    return { id };
  }

  async countUnread() {
    const count = await this.repository.count({ where: { isRead: false } });
    return { count };
  }
}
