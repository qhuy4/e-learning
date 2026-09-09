export class CreateCouponCommand {
  constructor(
    public readonly data: {
      createdBy: number;
      code: string;
      discountType: string;
      discountValue: number;
      minOrderAmount?: number;
      maxDiscountAmount?: number;
      usageLimit?: number;
      usageLimitPerUser?: number;
      scope?: string;
      couponOwnerType?: string;
      validFrom?: string;
      validUntil?: string;
      description?: string;
      courseIds?: number[];
    },
  ) {}
}
