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
import { CouponRedemptionService } from '@/modules/coupons/application/coupon-redemption.service';
import { Coupon } from '@/modules/coupons/domain/entity/coupon.entity';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  private readonly logger = new Logger(CreateOrderHandler.name);

  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,

    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,

    private readonly couponRedemption: CouponRedemptionService,
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

    let orderItems = items.map((i) => ({
      courseId: i.courseId,
      instructorId: i.instructorId,
      unitPrice: Number(i.unitPrice),
      finalPrice: Number(i.finalPrice),
    }));

    // Khi có mã giảm giá: server tự kiểm tra điều kiện và tự tính lại số tiền
    // giảm trên subtotal thực tế (không tin finalPrice gửi từ client).
    let coupon: Coupon | null = null;
    if (couponId) {
      const subtotal = orderItems.reduce((sum, i) => sum + i.unitPrice, 0);
      const validation = await this.couponRedemption.validate({
        userId,
        couponId,
        courseId: orderItems[0].courseId,
        amount: subtotal,
      });
      coupon = validation.coupon;

      // Áp giảm giá vào item đầu tiên (client hiện chỉ tạo đơn 1 khóa học).
      orderItems = orderItems.map((item, idx) =>
        idx === 0
          ? {
              ...item,
              finalPrice: Math.max(0, item.unitPrice - validation.discountAmount),
            }
          : item,
      );
      this.logger.log(
        `Coupon ${coupon.code} applied: -${validation.discountAmount} (item ${orderItems[0].unitPrice} -> ${orderItems[0].finalPrice})`,
      );
    }

    const subtotal = items.reduce((sum, i) => sum + Number(i.unitPrice), 0);
    const total = orderItems.reduce((sum, i) => sum + i.finalPrice, 0);
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

    const created = await this.orderRepository.create(order, orderItems);

    if (coupon && created.id != null) {
      await this.couponRedemption.recordUsage(
        coupon,
        userId,
        Number(created.id),
        discountAmount,
      );
      this.logger.log(
        `Coupon usage recorded: code ${coupon.code}, order ${created.id}, discount ${discountAmount}`,
      );
    }

    if (isFree) {
      for (const item of orderItems) {
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
