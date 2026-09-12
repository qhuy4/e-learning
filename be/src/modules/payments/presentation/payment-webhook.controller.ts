import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';

import { ProcessPaymentCallbackCommand } from '@/modules/payments/application/command/process-payment-callback.command';
import { PaymentGateway } from '@/modules/payments/domain/enum/payment-gateway.enum';
import { StripeService } from '@/modules/payments/infrastructure/gateway/stripe/stripe.service';

@Controller('payments/webhook')
export class PaymentWebhookController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly stripeService: StripeService,
  ) {}

  @Get('vnpay')
  async handleVnpayCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.commandBus.execute(
      new ProcessPaymentCallbackCommand({
        gateway: PaymentGateway.VNPAY,
        transactionId: req.query.vnp_TransactionNo as string,
        orderId: Number(req.query.vnp_TxnRef),
        amount: Number(req.query.vnp_Amount) / 100,
        status: req.query.vnp_ResponseCode === '00' ? 'success' : 'failed',
        rawResponse: req.query as Record<string, any>,
      }),
    );

    if (result) {
      const query = new URLSearchParams(req.query as Record<string, string>);
      return res.redirect(
        `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/payment/result?${query.toString()}`,
      );
    }

    return res.status(400).json({ message: 'Invalid callback' });
  }

  @Post('stripe')
  async handleStripeCallback(@Req() req: Request, @Res() res: Response) {
    const verification = await this.stripeService.verifyCallback({
      query: {
        'stripe-signature': req.headers['stripe-signature'] as string,
        rawBody: req['rawBody']?.toString() ?? JSON.stringify(req.body),
      },
    });

    if (verification.status === 'success') {
      await this.commandBus.execute(
        new ProcessPaymentCallbackCommand({
          gateway: PaymentGateway.STRIPE,
          transactionId: verification.transactionId,
          orderId: verification.orderId,
          amount: verification.amount,
          status: verification.status,
          rawResponse: verification.rawResponse,
        }),
      );
    }

    return res.json({ received: true });
  }
}
