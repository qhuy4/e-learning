import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

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
export class VnpayService implements PaymentGatewayService {
  private readonly logger = new Logger(VnpayService.name);

  private readonly tmnCode: string;
  private readonly hashSecret: string;
  private readonly payUrl: string;
  private readonly returnUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.tmnCode = this.configService.get<string>('VNP_TMN_CODE', '');
    this.hashSecret = this.configService.get<string>('VNP_HASH_SECRET', '');
    this.payUrl = this.configService.get<string>(
      'VNP_URL',
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    );
    this.returnUrl = this.configService.get<string>('VNP_RETURN_URL', '');
  }

  async createPaymentUrl(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const returnUrl = input.returnUrl ?? this.returnUrl;
    if (!this.tmnCode || !this.hashSecret || !returnUrl) {
      throw new Error(
        'VNPAY is not configured: set VNP_TMN_CODE, VNP_HASH_SECRET and VNP_RETURN_URL in environment',
      );
    }

    const now = new Date();
    const createDate = this.formatDate(now);
    const expireDate = this.formatDate(new Date(now.getTime() + 15 * 60 * 1000));

    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: input.currency,
      vnp_TxnRef: input.orderId.toString(),
      vnp_OrderInfo: input.description ?? `Thanh toan don hang ${input.orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: Math.round(input.amount * 100).toString(),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    const signData = this.getSortedQueryString(params);
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const paymentUrl = `${this.payUrl}?${signData}&vnp_SecureHash=${signed}`;

    this.logger.log(`VNPAY URL for order ${input.orderId}: ${paymentUrl}`);

    return {
      paymentUrl,
      transactionId: `VNP_${input.orderId}_${Date.now()}`,
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'refund',
      vnp_TmnCode: this.tmnCode,
      vnp_TransactionNo: input.transactionId,
      vnp_Amount: Math.round(input.amount * 100).toString(),
      vnp_OrderInfo: input.reason ?? 'Hoan tien',
      vnp_TransactionType: '02',
      vnp_CreateDate: this.formatDate(new Date()),
      vnp_IpAddr: '127.0.0.1',
    };

    const signData = this.getSortedQueryString(params);
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return {
      success: true,
      refundTransactionId: `VNP_REF_${input.transactionId}_${Date.now()}`,
      rawResponse: { ...params, vnp_SecureHash: signed },
    };
  }

  async verifyCallback(input: VerifyCallbackInput): Promise<VerifyCallbackOutput> {
    const { query } = input;

    const secureHash = query.vnp_SecureHash;
    const params = { ...query };
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const signData = this.getSortedQueryString(params);
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== checkSum) {
      this.logger.warn('VNPay callback checksum mismatch');
      return {
        transactionId: query.vnp_TransactionNo ?? '',
        orderId: Number(query.vnp_TxnRef),
        amount: Number(query.vnp_Amount) / 100,
        status: 'failed',
        rawResponse: query,
      };
    }

    const responseCode = query.vnp_ResponseCode;
    const isSuccess = responseCode === '00';

    return {
      transactionId: query.vnp_TransactionNo ?? '',
      orderId: Number(query.vnp_TxnRef),
      amount: Number(query.vnp_Amount) / 100,
      status: isSuccess ? 'success' : 'failed',
      rawResponse: query,
    };
  }

  private getSortedQueryString(params: Record<string, string>): string {
    return Object.keys(params)
      .sort()
      .map((key) => `${key}=${this.phpUrlEncode(params[key])}`)
      .join('&');
  }

  private phpUrlEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/%20/g, '+')
      .replace(/%2D/g, '-')
      .replace(/%5F/g, '_')
      .replace(/%2E/g, '.')
      .replace(/%7E/g, '~');
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      date.getFullYear().toString() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  }
}
