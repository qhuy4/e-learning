import { RevenueSplitPayoutStatus } from '@/modules/instructor-payouts/domain/enum/revenue-split-payout-status.enum';

/** Course được mapper nạp (relation `course`). */
export interface RevenueSplitCourseRef {
  id: number;
  title: string;
  thumbnail: string | null;
}

/** User được mapper nạp (relation `instructor`). */
export interface RevenueSplitInstructorRef {
  id: number;
  name: string;
}

export class RevenueSplit {
  private constructor(
    public readonly id: number,
    public readonly orderItemId: number,
    public readonly instructorId: number,
    public readonly courseId: number,
    public readonly grossAmount: number,
    public readonly platformFeePct: number,
    public readonly platformFeeAmount: number,
    public readonly instructorSharePct: number,
    public readonly instructorAmount: number,
    public readonly couponDiscount: number,
    public readonly payoutStatus: RevenueSplitPayoutStatus,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public readonly course?: RevenueSplitCourseRef,
    public readonly instructor?: RevenueSplitInstructorRef,
  ) {}

  static restore(params: {
    id: number;
    orderItemId: number;
    instructorId: number;
    courseId: number;
    grossAmount: number;
    platformFeePct: number;
    platformFeeAmount: number;
    instructorSharePct: number;
    instructorAmount: number;
    couponDiscount: number;
    payoutStatus: RevenueSplitPayoutStatus;
    createdAt: Date | null;
    updatedAt: Date | null;
    course?: RevenueSplitCourseRef;
    instructor?: RevenueSplitInstructorRef;
  }): RevenueSplit {
    return new RevenueSplit(
      params.id,
      params.orderItemId,
      params.instructorId,
      params.courseId,
      params.grossAmount,
      params.platformFeePct,
      params.platformFeeAmount,
      params.instructorSharePct,
      params.instructorAmount,
      params.couponDiscount,
      params.payoutStatus,
      params.createdAt,
      params.updatedAt,
      params.course,
      params.instructor,
    );
  }
}
