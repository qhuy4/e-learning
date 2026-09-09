import { OrderStatus } from '@/modules/orders/domain/enum/order-status.enum';

export class Order {
  private constructor(
    public readonly id: number | null,
    public readonly userId: number,
    public readonly couponId: number | null,
    public readonly orderCode: string,
    public readonly subtotal: number,
    public readonly discountAmount: number,
    public readonly total: number,
    public readonly currency: string,
    public _status: OrderStatus,
    public readonly paidAt: Date | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public items?: any[],
    public user?: any,
  ) {}

  get status(): OrderStatus {
    return this._status;
  }

  static create(params: {
    userId: number;
    couponId?: number;
    orderCode: string;
    subtotal: number;
    discountAmount?: number;
    total: number;
    currency?: string;
    status?: OrderStatus;
  }): Order {
    const now = new Date();
    return new Order(
      null,
      params.userId,
      params.couponId ?? null,
      params.orderCode,
      params.subtotal,
      params.discountAmount ?? 0,
      params.total,
      params.currency ?? 'VND',
      params.status ?? OrderStatus.PENDING,
      null,
      now,
      now,
    );
  }

  static restore(params: {
    id: number;
    userId: number;
    couponId: number | null;
    orderCode: string;
    subtotal: number;
    discountAmount: number;
    total: number;
    currency: string;
    status: OrderStatus;
    paidAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    items?: any[];
    user?: any;
  }): Order {
    return new Order(
      params.id,
      params.userId,
      params.couponId,
      params.orderCode,
      params.subtotal,
      params.discountAmount,
      params.total,
      params.currency,
      params.status,
      params.paidAt,
      params.createdAt,
      params.updatedAt,
      params.items,
      params.user,
    );
  }

  updateStatus(newStatus: OrderStatus): void {
    (this as { _status: OrderStatus })._status = newStatus;
  }
}
