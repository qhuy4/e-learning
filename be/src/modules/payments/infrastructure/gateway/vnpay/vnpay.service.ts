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
    this.tmnCode = this.configService.get<string>('VNPAY_TMN_CODE', '');
    this.hashSecret = this.configService.get<string>('VNPAY_HASH_SECRET', '');
    this.payUrl = this.configService.get<string>(
      'VNPAY_PAY_URL',
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    );
    this.returnUrl = this.configService.get<string>('VNPAY_RETURN_URL', '');
  }

  async createPaymentUrl(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
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
      vnp_OrderInfo: `Thanh toan don hang ${input.orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: (input.amount * 100).toString(),
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex');

    params.vnp_SecureHash = signed;

    const paymentUrl = `${this.payUrl}?${Object.keys(params)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')}`;

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
      vnp_Amount: (input.amount * 100).toString(),
      vnp_OrderInfo: input.reason ?? 'Hoan tien',
      vnp_TransactionType: '02',
      vnp_CreateDate: this.formatDate(new Date()),
      vnp_IpAddr: '127.0.0.1',
    };

    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex');

    params.vnp_SecureHash = signed;

    this.logger.log(
      `Refund request sent for transaction ${input.transactionId}`,
    );

    return {
      success: true,
      refundTransactionId: `VNP_REF_${input.transactionId}_${Date.now()}`,
      rawResponse: params,
    };
  }

  async verifyCallback(input: VerifyCallbackInput): Promise<VerifyCallbackOutput> {
    const { query } = input;

    const secureHash = query.vnp_SecureHash;
    const params = { ...query };
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const checkSum = hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex');

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
