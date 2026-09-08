import { Order } from '@/modules/orders/domain/entity/order.entity';
import { AdminOrderListResponseDto } from '@/modules/orders/presentation/dto/admin-order-list-response.dto';
import { AdminOrderDetailResponseDto, AdminOrderItemDto } from '@/modules/orders/presentation/dto/admin-order-detail-response.dto';

export class AdminOrderDtoMapper {
  static toListDto(order: Order): AdminOrderListResponseDto {
    return {
      id: String(order.id),
      orderCode: order.orderCode,
      userName: order.user?.name ?? '',
      userEmail: order.user?.email ?? '',
      itemCount: order.items?.length ?? 0,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
    };
  }

  static toDetailDto(order: Order): AdminOrderDetailResponseDto {
    return {
      id: String(order.id),
      orderCode: order.orderCode,
      userId: String(order.userId),
      userName: order.user?.name ?? '',
      userEmail: order.user?.email ?? '',
      couponId: order.couponId ? String(order.couponId) : null,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      total: order.total,
      status: order.status,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: (order.items ?? []).map((item) => ({
        id: String(item.id),
        courseId: String(item.courseId),
        courseTitle: item.course?.title ?? '',
        courseThumbnail: item.course?.thumbnail ?? null,
        instructorId: String(item.instructorId),
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount,
        finalPrice: item.finalPrice,
      })),
    };
  }
}
