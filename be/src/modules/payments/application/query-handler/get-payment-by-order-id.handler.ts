import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPaymentByOrderIdQuery } from '@/modules/payments/application/query/get-payment-by-order-id.query';
import {
  PAYMENT_REPOSITORY,
  IPaymentRepository,
} from '@/modules/payments/domain/repository/payment.repository';

@QueryHandler(GetPaymentByOrderIdQuery)
export class GetPaymentByOrderIdHandler
  implements IQueryHandler<GetPaymentByOrderIdQuery>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(query: GetPaymentByOrderIdQuery) {
    const payment = await this.paymentRepository.findByOrderId(
      query.orderId,
    );

    if (!payment) {
      throw new NotFoundException(
        `Payment for order ID ${query.orderId} not found`,
      );
    }

    return {
      id: payment.id,
      orderId: payment.orderId,
      transactionId: payment.transactionId,
      gateway: payment.gateway,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      gatewayResponse: payment.gatewayResponse,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
