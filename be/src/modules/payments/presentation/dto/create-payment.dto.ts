import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentGateway } from '@/modules/payments/domain/enum/payment-gateway.enum';

export class CreatePaymentDto {
  @IsNumber()
  orderId: number;

  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  @IsOptional()
  description?: string;
}
