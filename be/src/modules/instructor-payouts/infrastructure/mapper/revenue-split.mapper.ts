import { RevenueSplitOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/revenue-split.orm-entity';
import { RevenueSplit } from '@/modules/instructor-payouts/domain/entity/revenue-split.entity';
import { RevenueSplitPayoutStatus } from '@/modules/instructor-payouts/domain/enum/revenue-split-payout-status.enum';

export class RevenueSplitMapper {
  static toDomain(entity: RevenueSplitOrmEntity): RevenueSplit {
    return RevenueSplit.restore({
      id: Number(entity.id),
      orderItemId: entity.orderItemId === null ? null : Number(entity.orderItemId),
      bookingId: entity.bookingId === null ? null : Number(entity.bookingId),
      instructorId: Number(entity.instructorId),
      courseId: entity.courseId === null ? null : Number(entity.courseId),
      grossAmount: Number(entity.grossAmount),
      platformFeePct: Number(entity.platformFeePct),
      platformFeeAmount: Number(entity.platformFeeAmount),
      instructorSharePct: Number(entity.instructorSharePct),
      instructorAmount: Number(entity.instructorAmount),
      couponDiscount: Number(entity.couponDiscount),
      payoutStatus: entity.payoutStatus as RevenueSplitPayoutStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      course: entity.course
        ? { id: Number(entity.course.id), title: entity.course.title, thumbnail: entity.course.thumbnail }
        : undefined,
      instructor: entity.instructor
        ? { id: Number(entity.instructor.id), name: entity.instructor.name }
        : undefined,
    });
  }
}
