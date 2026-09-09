import { Order } from '@/modules/orders/domain/entity/order.entity';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface IOrderRepository {
  findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Order[]; meta: { page: number; limit: number; total: number; totalPages: number } }>;

  findAllByUser(userId: number, options?: {
    page: number;
    limit: number;
    status?: string;
  }): Promise<{ data: Order[]; total: number }>;

  findById(id: number): Promise<Order | null>;

  create(order: Order, items: { courseId: number; instructorId: number; unitPrice: number; finalPrice: number }[]): Promise<Order>;

  updateStatus(id: number, status: string): Promise<Order | null>;

  existsByCourseId(courseId: number): Promise<boolean>;
}
