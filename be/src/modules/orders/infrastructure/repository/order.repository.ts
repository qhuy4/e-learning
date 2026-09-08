import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { OrderOrmEntity } from '@/modules/orders/infrastructure/entity/order.orm-entity';
import { IOrderRepository } from '@/modules/orders/domain/repository/order.repository';
import { OrderMapper } from '@/modules/orders/infrastructure/mapper/order.mapper';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly repository: Repository<OrderOrmEntity>,
  ) {}

  async findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, keyword, status, sortBy, sortOrder } = options;

    const query = this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.course', 'course');

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('order.orderCode ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('user.name ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('user.email ILIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    if (status !== undefined) {
      query.andWhere('order.status = :status', { status });
    }

    const sortableColumns: Record<string, string> = {
      orderCode: 'order.order_code',
      total: 'order.total',
      status: 'order.status',
      createdAt: 'order.created_at',
    };

    const sortKey = sortBy && sortableColumns[sortBy] ? sortableColumns[sortBy] : 'order.created_at';
    const sortDirection: 'ASC' | 'DESC' = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(sortKey, sortDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    const data = entities.map((entity) => OrderMapper.toDomain(entity));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
      relations: { user: true, items: { course: true } },
    });

    if (!entity) return null;

    return OrderMapper.toDomain(entity);
  }

  async updateStatus(id: number, status: string) {
    await this.repository.update(id.toString(), { status });
    return this.findById(id);
  }
}
