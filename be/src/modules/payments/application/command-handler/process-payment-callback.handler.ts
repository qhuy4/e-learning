import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';

import { ProcessPaymentCallbackCommand } from '@/modules/payments/application/command/process-payment-callback.command';
import {
  PAYMENT_REPOSITORY,
  IPaymentRepository,
} from '@/modules/payments/domain/repository/payment.repository';
import { PaymentStatus } from '@/modules/payments/domain/enum/payment-status.enum';

import { ORDER_REPOSITORY, IOrderRepository } from '@/modules/orders/domain/repository/order.repository';
import { OrderStatus } from '@/modules/orders/domain/enum/order-status.enum';

import { ENROLLMENT_REPOSITORY, IEnrollmentRepository } from '@/modules/enrollments/domain/repository/enrollment.repository';
import { Enrollment } from '@/modules/enrollments/domain/entity/enrollment.entity';
import { EnrollmentStatus } from '@/modules/enrollments/domain/enum/enrollment-status.enum';

@CommandHandler(ProcessPaymentCallbackCommand)
export class ProcessPaymentCallbackHandler
  implements ICommandHandler<ProcessPaymentCallbackCommand>
{
  private readonly logger = new Logger(ProcessPaymentCallbackHandler.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,

    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,

    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async execute(command: ProcessPaymentCallbackCommand) {
    const { transactionId, orderId, status, rawResponse } = command.data;

    const payment = await this.paymentRepository.findByOrderId(orderId);

    if (!payment) {
      this.logger.warn(
        `Callback for unknown order ${orderId}, transaction ${transactionId}`,
      );
      return null;
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      this.logger.warn(
        `Payment ${payment.id} already completed, ignoring callback`,
      );
      return payment;
    }

    if (status === 'success') {
      payment.markAsCompleted(transactionId, rawResponse);
    } else {
      payment.markAsFailed(rawResponse);
    }

    const updated = await this.paymentRepository.update(payment);

    this.logger.log(
      `Payment ${updated.id} updated to ${updated.status} via callback`,
    );

    if (status === 'success') {
      await this.handlePaymentSuccess(orderId);
    }

    return updated;
  }

  private async handlePaymentSuccess(orderId: number): Promise<void> {
    try {
      await this.orderRepository.updateStatus(orderId, OrderStatus.PAID);
      this.logger.log(`Order ${orderId} updated to PAID`);

      const order = await this.orderRepository.findById(orderId);
      if (order?.items) {
        for (const item of order.items) {
          const enrollment = Enrollment.restore({
            id: 0,
            userId: order.userId,
            courseId: item.courseId,
            status: EnrollmentStatus.ACTIVE,
            progress: 0,
            pricePaid: item.finalPrice,
            currency: order.currency,
            completedAt: null,
            lastAccessedAt: null,
            expiresAt: null,
            enrolledAt: new Date(),
            createdAt: new Date(),
            updatedAt: null,
          });

          const exists = await this.enrollmentRepository.existsActiveByUserAndCourse(
            order.userId,
            item.courseId,
          );

          if (!exists) {
            await this.enrollmentRepository.create(enrollment);
            this.logger.log(
              `Enrollment created: user ${order.userId}, course ${item.courseId}`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to process payment success for order ${orderId}: ${(error as Error).message}`,
      );
    }
  }
}
