import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentGateway } from '@/modules/payments/domain/enum/payment-gateway.enum';

export class RetryPaymentDto {
  @IsEnum(PaymentGateway)
  @IsOptional()
  gateway?: PaymentGateway;
}

export class RefundPaymentDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ProcessCallbackDto {
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;
}

export class QueryPaymentDto {
  @IsNumber()
  @IsOptional()
  orderId?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  gateway?: string;
}
