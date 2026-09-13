export class GetAdminCouponsResponseDto {
  id: number;
  createdBy: number;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageLimitPerUser: number;
  usedCount: number;
  scope: string;
  couponOwnerType: string;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date | null;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  courses?: any[];
  creator?: any;
}
