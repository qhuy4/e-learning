export class UpdateCouponCommand {
  constructor(
    public readonly data: {
      id: number;
      code?: string;
      discountType?: string;
      discountValue?: number;
      minOrderAmount?: number;
      maxDiscountAmount?: number;
      usageLimit?: number;
      usageLimitPerUser?: number;
      scope?: string;
      validFrom?: string;
      validUntil?: string;
      description?: string;
      courseIds?: number[];
    },
  ) {}
}
