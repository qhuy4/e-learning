import { Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetPaymentsQuery } from '@/modules/payments/application/query/get-payments.query';
import { GetPaymentByIdQuery } from '@/modules/payments/application/query/get-payment-by-id.query';
import { RefundPaymentCommand } from '@/modules/payments/application/command/refund-payment.command';
import { RetryPaymentCommand } from '@/modules/payments/application/command/retry-payment.command';
import { CancelPaymentCommand } from '@/modules/payments/application/command/cancel-payment.command';

@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
    @Query('gateway') gateway?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.queryBus.execute(
      new GetPaymentsQuery({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        orderId: orderId ? Number(orderId) : undefined,
        status: status ? Number(status) : undefined,
        gateway,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc' | undefined,
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetPaymentByIdQuery(id));
  }

  @Post(':id/refund')
  refund(
    @Param('id', ParseIntPipe) id: number,
    @Query('reason') reason?: string,
  ) {
    return this.commandBus.execute(
      new RefundPaymentCommand({ id, reason }),
    );
  }

  @Post(':id/retry')
  retry(
    @Param('id', ParseIntPipe) id: number,
    @Query('gateway') gateway?: string,
  ) {
    return this.commandBus.execute(
      new RetryPaymentCommand({
        paymentId: id,
        gateway: gateway as any,
      }),
    );
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new CancelPaymentCommand(id));
  }
}
