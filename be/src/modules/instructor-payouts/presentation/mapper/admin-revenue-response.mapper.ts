import { RevenueSplit } from '@/modules/instructor-payouts/domain/entity/revenue-split.entity';

export class AdminRevenueResponseMapper {
  static toResponse(split: RevenueSplit) {
    return {
      id: split.id,
      grossAmount: split.grossAmount,
      platformFeePct: split.platformFeePct,
      platformFeeAmount: split.platformFeeAmount,
      instructorSharePct: split.instructorSharePct,
      instructorAmount: split.instructorAmount,
      couponDiscount: split.couponDiscount,
      payoutStatus: split.payoutStatus,
      createdAt: split.createdAt,
      updatedAt: split.updatedAt,
      course: split.course,
      instructor: split.instructor,
    };
  }
}
