import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ValidateCouponDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber()
  couponId?: number;

  @IsOptional()
  @IsNumber()
  courseId?: number;

  /** Giá trị đơn hàng (subtotal) dùng để tính mức giảm và kiểm tra hạn mức tối thiểu. */
  @IsOptional()
  @IsNumber()
  amount?: number;
}
