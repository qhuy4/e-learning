import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, Logger } from '@nestjs/common';

import { CreateOrderCommand } from '@/modules/orders/application/command/create-order.command';
import { Order } from '@/modules/orders/domain/entity/order.entity';
import {
  ORDER_REPOSITORY,
  IOrderRepository,
} from '@/modules/orders/domain/repository/order.repository';
import { OrderStatus } from '@/modules/orders/domain/enum/order-status.enum';

import {
  ENROLLMENT_REPOSITORY,
  IEnrollmentRepository,
} from '@/modules/enrollments/domain/repository/enrollment.repository';
import { Enrollment } from '@/modules/enrollments/domain/entity/enrollment.entity';
import { EnrollmentStatus } from '@/modules/enrollments/domain/enum/enrollment-status.enum';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  private readonly logger = new Logger(CreateOrderHandler.name);

  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,

    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async execute(command: CreateOrderCommand) {
    const { userId, couponId, items } = command.data;

    if (!items || !items.length) {
      throw new BadRequestException('Order must have at least one item');
    }

    const courseIds = items.map((i) => i.courseId);
    const uniqueIds = new Set(courseIds);
    if (uniqueIds.size !== courseIds.length) {
      throw new BadRequestException('Duplicate courses in order');
    }

    const subtotal = items.reduce((sum, i) => sum + i.unitPrice, 0);
    const total = items.reduce((sum, i) => sum + i.finalPrice, 0);
    const discountAmount = subtotal - total;

    const orderCode = `ODD${Date.now()}`;
    const isFree = total === 0;

    const order = Order.create({
      userId,
      couponId,
      orderCode,
      subtotal,
      discountAmount,
      total,
      status: isFree ? OrderStatus.PAID : OrderStatus.PENDING,
    });

    const created = await this.orderRepository.create(order, items);

    if (isFree) {
      for (const item of items) {
        const exists = await this.enrollmentRepository.existsActiveByUserAndCourse(
          userId,
          item.courseId,
        );

        if (!exists) {
          const enrollment = Enrollment.restore({
            id: 0,
            userId,
            courseId: item.courseId,
            status: EnrollmentStatus.ACTIVE,
            progress: 0,
            pricePaid: 0,
            currency: 'VND',
            completedAt: null,
            lastAccessedAt: null,
            expiresAt: null,
            enrolledAt: new Date(),
            createdAt: new Date(),
            updatedAt: null,
          });

          await this.enrollmentRepository.create(enrollment);
          this.logger.log(
            `Free enrollment created: user ${userId}, course ${item.courseId}`,
          );
        }
      }
    }

    return created;
  }
}
