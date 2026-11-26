import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Logger } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { UpdateBookingStatusCommand } from '@/modules/bookings/application/command/update-booking-status.command';
import { BookingRepository } from '@/modules/bookings/infrastructure/repository/booking.repository';
import { DataSource } from 'typeorm';
import { MeetingRoomStatus } from '@/modules/bookings/domain/enum/meeting-room-status.enum';
import { BookingStatusEnum } from '@/modules/bookings/domain/enum/booking-status.enum';
import { BookingPaymentStatus } from '@/modules/bookings/domain/enum/booking-payment-status.enum';
import { MeetingRoomRepositoryImpl } from '@/modules/meeting-room/infrastructure/repository/meeting-room.repository';
import { CouponOrmEntity } from '@/modules/coupons/infrastructure/entity/coupon.orm-entity';
import { CouponType } from '@/modules/coupons/domain/enum/coupon-type.enum';
import { CouponScope } from '@/modules/coupons/domain/enum/coupon-scope.enum';
import { CouponOwnerType } from '@/modules/coupons/domain/enum/coupon-owner-type.enum';
import { MailService } from '@/modules/auth/services/mail.service';

const VALID_TRANSITIONS: Record<number, number[]> = {
  [BookingStatusEnum.CANCELLED]: [],
  [BookingStatusEnum.PENDING]: [
    BookingStatusEnum.CONFIRMED,
    BookingStatusEnum.CANCELLED,
  ],
  [BookingStatusEnum.CONFIRMED]: [BookingStatusEnum.CANCELLED],
};

@CommandHandler(UpdateBookingStatusCommand)
export class UpdateBookingStatusHandler implements ICommandHandler<UpdateBookingStatusCommand> {
  private readonly logger = new Logger(UpdateBookingStatusHandler.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly bookingRepository: BookingRepository,
    private readonly meetingRoomRepository: MeetingRoomRepositoryImpl,
    private readonly mailService: MailService,
  ) {}

  async execute(command: UpdateBookingStatusCommand) {
    const booking = await this.bookingRepository.findById(command.id);

    if (!booking) {
      throw new AppException(ErrorCode.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const allowed = VALID_TRANSITIONS[booking.status] ?? [];

    if (!allowed.includes(command.status)) {
      throw new AppException(
        ErrorCode.BOOKING_INVALID_STATUS_TRANSITION,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      command.status === BookingStatusEnum.CONFIRMED &&
      booking.paymentStatus !== BookingPaymentStatus.PAID
    ) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const updatedBooking = await this.bookingRepository.updateStatus(
        command.id,
        command.status,
        manager,
      );

      if (command.status === BookingStatusEnum.CONFIRMED) {
        await this.meetingRoomRepository.create(
          {
            bookingId: command.id,
            roomId: `booking-${command.id}`,
            status: MeetingRoomStatus.WAITING,
          },
          manager,
        );
      }

      let voucherCode: string | null = null;
      let voucherMinutes: number | null = null;
      if (
        command.rejectedByInstructor &&
        command.status === BookingStatusEnum.CANCELLED
      ) {
        voucherCode = `REBOOK${booking.id}`;
        voucherMinutes = this.durationMinutes(
          booking.startTime,
          booking.endTime,
        );
        const coupons = manager.getRepository(CouponOrmEntity);
        const existing = await coupons.findOne({
          where: { code: voucherCode },
        });
        if (!existing) {
          await coupons.save(
            coupons.create({
              createdBy: String(booking.instructorId),
              code: voucherCode,
              discountType: CouponType.PERCENTAGE,
              discountValue: '100',
              minOrderAmount: '0',
              maxDiscountAmount: null,
              usageLimit: 1,
              usageLimitPerUser: 1,
              usedCount: 0,
              scope: CouponScope.ALL,
              couponOwnerType: CouponOwnerType.INSTRUCTOR,
              isActive: true,
              validFrom: new Date(),
              validUntil: null,
              description: `Voucher 100% cho booking tối đa ${voucherMinutes} phút`,
              recipientUserId: String(booking.studentId),
              maxBookingMinutes: voucherMinutes,
            }),
          );
        }
      }

      return { updatedBooking, voucherCode, voucherMinutes };
    });

    if (result.voucherCode && result.voucherMinutes) {
      try {
        await this.mailService.sendHtml(
          booking.studentEmail,
          'Voucher 100% cho lần booking tiếp theo',
          `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
            <h2>Booking đã được giảng viên từ chối</h2>
            <p>PiEMind gửi bạn voucher giảm 100% cho lần booking tiếp theo.</p>
            <p style="font-size:22px;font-weight:bold;letter-spacing:2px">${result.voucherCode}</p>
            <p>Voucher áp dụng cho booking tối đa <strong>${result.voucherMinutes} phút</strong>. Bạn có thể đặt thời lượng ngắn hơn, nhưng không thể dùng cho booking dài hơn.</p>
          </div>`,
        );
      } catch (error) {
        this.logger.warn(
          `Voucher ${result.voucherCode} đã tạo nhưng gửi email thất bại: ${(error as Error).message}`,
        );
      }
    }

    return result.updatedBooking;
  }

  private durationMinutes(startTime: string, endTime: string): number {
    const toMinutes = (value: string) => {
      const [hours, minutes] = value.split(':').map(Number);
      return hours * 60 + minutes;
    };
    return toMinutes(endTime) - toMinutes(startTime);
  }
}
