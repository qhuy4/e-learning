import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';

import { ProcessPaymentCallbackCommand } from '@/modules/payments/application/command/process-payment-callback.command';
import { PaymentGateway } from '@/modules/payments/domain/enum/payment-gateway.enum';

@Controller('payments/webhook')
export class PaymentWebhookController {
  constructor(private readonly commandBus: CommandBus) {}

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
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: any;

    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(
        req['rawBody'] ?? JSON.stringify(req.body),
        sig,
        endpointSecret,
      );
    } catch {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      await this.commandBus.execute(
        new ProcessPaymentCallbackCommand({
          gateway: PaymentGateway.STRIPE,
          transactionId: session.id,
          orderId: Number(session.metadata?.orderId ?? 0),
          amount: (session.amount_total ?? 0) / 100,
          status: 'success',
          rawResponse: event,
        }),
      );
    }

    return res.json({ received: true });
  }
}
