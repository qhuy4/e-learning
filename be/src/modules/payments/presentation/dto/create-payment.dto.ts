import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentGateway } from '@/modules/payments/domain/enum/payment-gateway.enum';

export class CreatePaymentDto {
  @IsNumber()
  @Type(() => Number)
  orderId: number;

  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  @IsOptional()
  description?: string;
}
