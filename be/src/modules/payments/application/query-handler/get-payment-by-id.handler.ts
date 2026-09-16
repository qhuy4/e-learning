import { Inject, HttpStatus } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPaymentByIdQuery } from '@/modules/payments/application/query/get-payment-by-id.query';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import {
  PAYMENT_REPOSITORY,
  IPaymentRepository,
} from '@/modules/payments/domain/repository/payment.repository';

@QueryHandler(GetPaymentByIdQuery)
export class GetPaymentByIdHandler
  implements IQueryHandler<GetPaymentByIdQuery>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(query: GetPaymentByIdQuery) {
    const payment = await this.paymentRepository.findById(query.id);

    if (!payment) {
      throw new AppException(ErrorCode.PAYMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
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
