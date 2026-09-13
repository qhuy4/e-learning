import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  @IsNumber()
  courseId: number;

  @IsNumber()
  instructorId: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  finalPrice: number;
}

export class CreateOrderDto {
  @IsNumber()
  @IsOptional()
  couponId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
