import { OrderOrmEntity } from '@/modules/orders/infrastructure/entity/order.orm-entity';
import { Order } from '@/modules/orders/domain/entity/order.entity';
import { OrderItem } from '@/modules/orders/domain/entity/order-item.entity';

export class OrderMapper {
  static toDomain(entity: OrderOrmEntity): Order {
    const items = entity.items?.map((item) =>
      OrderItem.restore({
        id: Number(item.id),
        orderId: Number(item.orderId),
        courseId: Number(item.courseId),
        instructorId: Number(item.instructorId),
        unitPrice: Number(item.unitPrice),
        discountAmount: Number(item.discountAmount),
        finalPrice: Number(item.finalPrice),
        createdAt: item.createdAt,
        course: item.course ? { id: item.course.id, title: item.course.title, thumbnail: item.course.thumbnail } : undefined,
      }),
    );

    return Order.restore({
      id: Number(entity.id),
      userId: Number(entity.userId),
      couponId: entity.couponId ? Number(entity.couponId) : null,
      orderCode: entity.orderCode,
      subtotal: Number(entity.subtotal),
      discountAmount: Number(entity.discountAmount),
      total: Number(entity.total),
      currency: entity.currency,
      status: entity.status as any,
      paidAt: entity.paidAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      items,
      user: entity.user,
    });
  }
}
