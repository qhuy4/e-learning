import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PaginationDto } from '@/common/pagination/pagination.dto';

import { ProcessPaymentCommand } from '@/modules/payments/application/command/process-payment.command';
import { CancelPaymentCommand } from '@/modules/payments/application/command/cancel-payment.command';
import { RefundPaymentCommand } from '@/modules/payments/application/command/refund-payment.command';
import { RetryPaymentCommand } from '@/modules/payments/application/command/retry-payment.command';

import { GetPaymentByIdQuery } from '@/modules/payments/application/query/get-payment-by-id.query';
import { GetPaymentByOrderIdQuery } from '@/modules/payments/application/query/get-payment-by-order-id.query';
import { GetPaymentsQuery } from '@/modules/payments/application/query/get-payments.query';

import { CreatePaymentDto } from '@/modules/payments/presentation/dto/create-payment.dto';
import { RefundPaymentDto } from '@/modules/payments/presentation/dto/payment-action.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  processPayment(@Body() dto: CreatePaymentDto) {
    return this.commandBus.execute(
      new ProcessPaymentCommand({
        orderId: dto.orderId,
        gateway: dto.gateway,
        amount: dto.amount,
        currency: dto.currency,
        description: dto.description,
      }),
    );
  }

  @Get()
  findAll(
    @Query() query: PaginationDto,
    @Query('orderId') orderId?: number,
    @Query('status') status?: string,
    @Query('gateway') gateway?: string,
  ) {
    return this.queryBus.execute(
      new GetPaymentsQuery({
        page: query.page,
        limit: query.limit,
        orderId,
        status,
        gateway,
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetPaymentByIdQuery(id));
  }

  @Get('order/:orderId')
  findByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.queryBus.execute(new GetPaymentByOrderIdQuery(orderId));
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.execute(new CancelPaymentCommand(id));
  }

  @Post(':id/refund')
  refund(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RefundPaymentDto,
  ) {
    return this.commandBus.execute(
      new RefundPaymentCommand({ id, reason: dto.reason }),
    );
  }

  @Post(':id/retry')
  retry(
    @Param('id', ParseIntPipe) id: number,
    @Body('gateway') gateway?: string,
  ) {
    return this.commandBus.execute(
      new RetryPaymentCommand({
        paymentId: id,
        gateway: gateway as any,
      }),
    );
  }
}
