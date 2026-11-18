import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import {
  PaymentGatewayService,
  CreatePaymentInput,
  CreatePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  VerifyCallbackInput,
  VerifyCallbackOutput,
} from '@/modules/payments/domain/gateway/payment-gateway.interface';

@Injectable()
export class StripeService implements PaymentGatewayService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): Stripe {
    if (!this.stripe) {
      const secretKey = this.configService.get<string>('STRIPE_SECRET');
      if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY is not configured');
      }
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
      });
    }
    return this.stripe;
  }

  async createPaymentUrl(
    input: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    const client = this.getClient();

    const session = await client.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: input.currency.toLowerCase(),
            product_data: {
              name: input.description ?? `Order #${input.orderId}`,
            },
            unit_amount: Math.round(input.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get<string>('CLIENT_URL', 'http://localhost:5173')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get<string>('CLIENT_URL', 'http://localhost:5173')}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        orderId: input.orderId.toString(),
      },
    });

    return {
      paymentUrl: session.url!,
      transactionId: session.id,
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const client = this.getClient();

    const session = await client.checkout.sessions.retrieve(
      input.transactionId,
    );

    const paymentIntentId = session.payment_intent as string;

    const refund = await client.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(input.amount * 100),
      reason: 'requested_by_customer',
    });

    this.logger.log(
      `Refund created: ${refund.id} for session ${input.transactionId}`,
    );

    return {
      success: refund.status === 'succeeded',
      refundTransactionId: refund.id,
      rawResponse: refund as unknown as Record<string, any>,
    };
  }

  verifyCallback(input: VerifyCallbackInput): Promise<VerifyCallbackOutput> {
    const client = this.getClient();

    const sig = input.query['stripe-signature'];
    const endpointSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
      '',
    );

    let event: Stripe.Event;

    try {
      event = client.webhooks.constructEvent(
        input.query['rawBody'] ?? '',
        sig,
        endpointSecret,
      );
    } catch (err) {
      this.logger.warn(`Stripe webhook signature verification failed: ${err}`);
      return Promise.resolve({
        transactionId: '',
        orderId: 0,
        amount: 0,
        status: 'failed',
        rawResponse: input.query,
      });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      return Promise.resolve({
        transactionId: session.id,
        orderId: Number(session.metadata?.orderId ?? 0),
        amount: (session.amount_total ?? 0) / 100,
        status: 'success',
        rawResponse: event,
      });
    }

    return Promise.resolve({
      transactionId: '',
      orderId: 0,
      amount: 0,
      status: 'failed',
      rawResponse: event,
    });
  }
}
