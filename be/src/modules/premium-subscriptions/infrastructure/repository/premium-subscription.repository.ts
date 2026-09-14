import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { PremiumSubscriptionOrmEntity } from '@/modules/premium-subscriptions/infrastructure/entity/premium-subscription.orm-entity';

@Injectable()
export class PremiumSubscriptionRepository {
  constructor(
    @InjectRepository(PremiumSubscriptionOrmEntity)
    private readonly repository: Repository<PremiumSubscriptionOrmEntity>,
  ) {}

  async findAll(options: {
    page: number;
    limit: number;
    status?: number;
    keyword?: string;
  }) {
    const { page, limit, status, keyword } = options;

    const qb = this.repository
      .createQueryBuilder('ps')
      .leftJoinAndSelect('ps.user', 'user');

    if (status !== undefined) {
      qb.andWhere('ps.status = :status', { status });
    }

    if (keyword) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('user.email ILIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    qb.orderBy('ps.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();

    const data = entities.map((e) => ({
      id: Number(e.id),
      userId: Number(e.userId),
      startedAt: e.startedAt,
      expiredAt: e.expiredAt,
      status: e.status,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      user: e.user ? { id: Number(e.user.id), name: e.user.name, email: e.user.email } : undefined,
    }));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
      relations: { user: true },
    });
    if (!entity) return null;
    return {
      id: Number(entity.id),
      userId: Number(entity.userId),
      startedAt: entity.startedAt,
      expiredAt: entity.expiredAt,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      user: entity.user ? { id: Number(entity.user.id), name: entity.user.name, email: entity.user.email } : undefined,
    };
  }

  async update(id: number, data: Partial<PremiumSubscriptionOrmEntity>) {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    if (!entity) return null;
    Object.assign(entity, data);
    await this.repository.save(entity);
    return this.findById(id);
  }

  async remove(id: number) {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    if (!entity) return null;
    await this.repository.remove(entity);
    return { id };
  }
}
