import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { OrderOrmEntity } from '@/modules/orders/infrastructure/entity/order.orm-entity';
import { OrderItemOrmEntity } from '@/modules/orders/infrastructure/entity/order-item.orm-entity';
import { IOrderRepository } from '@/modules/orders/domain/repository/order.repository';
import { OrderMapper } from '@/modules/orders/infrastructure/mapper/order.mapper';
import { Order } from '@/modules/orders/domain/entity/order.entity';

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
    status?: number;
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

  async findAllByUser(userId: number, options?: { page: number; limit: number; status?: number }) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;

    const query = this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.course', 'course')
      .where('order.user_id = :userId', { userId: userId.toString() });

    if (options?.status !== undefined) {
      query.andWhere('order.status = :status', { status: options.status });
    }

    query
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((e) => OrderMapper.toDomain(e)),
      total,
    };
  }

  async create(
    order: Order,
    items: { courseId: number; instructorId: number; unitPrice: number; finalPrice: number }[],
  ): Promise<Order> {
    const orderEntity = this.repository.create({
      userId: String(order.userId),
      couponId: order.couponId ? String(order.couponId) : undefined,
      orderCode: order.orderCode,
      subtotal: String(order.subtotal),
      discountAmount: String(order.discountAmount),
      total: String(order.total),
      currency: order.currency,
      status: order.status,
    });

    const savedOrder = await this.repository.save(orderEntity);

    const orderId = Array.isArray(savedOrder) ? savedOrder[0].id : savedOrder.id;

    const itemEntities = items.map((item) => ({
      orderId: String(orderId),
      courseId: String(item.courseId),
      instructorId: String(item.instructorId),
      unitPrice: String(item.unitPrice),
      discountAmount: String(item.unitPrice - item.finalPrice),
      finalPrice: String(item.finalPrice),
    }));

    await this.repository.manager
      .getRepository(OrderItemOrmEntity)
      .save(itemEntities);

    return this.findById(Number(orderId)) as Promise<Order>;
  }

  async existsByCourseId(courseId: number): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .where('item.course_id = :courseId', { courseId: courseId.toString() })
      .andWhere('order.status = :status', { status: 3 })
      .getCount();

    return count > 0;
  }

  async updateStatus(id: number, status: number) {
    await this.repository.update(id.toString(), { status });
    return this.findById(id);
  }
}
