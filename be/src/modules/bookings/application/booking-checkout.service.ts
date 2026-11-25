import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateBookingCommand } from '@/modules/bookings/application/command/create-booking.command';
import { BookingStatusEnum } from '@/modules/bookings/domain/enum/booking-status.enum';
import { BookingPaymentStatus } from '@/modules/bookings/domain/enum/booking-payment-status.enum';
import { BookingOrmEntity } from '@/modules/bookings/infrastructure/entity/booking.orm-entity';
import { BookingPaymentOrmEntity } from '@/modules/bookings/infrastructure/entity/booking-payment.orm-entity';
import { MeetingRoomRepositoryImpl } from '@/modules/meeting-room/infrastructure/repository/meeting-room.repository';
import { MeetingRoomStatus } from '@/modules/bookings/domain/enum/meeting-room-status.enum';
import { VnpayService } from '@/modules/payments/infrastructure/gateway/vnpay/vnpay.service';

@Injectable()
export class BookingCheckoutService {
  private readonly logger = new Logger(BookingCheckoutService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
    private readonly vnpay: VnpayService,
    private readonly meetingRooms: MeetingRoomRepositoryImpl,
    @InjectRepository(BookingOrmEntity)
    private readonly bookings: Repository<BookingOrmEntity>,
    @InjectRepository(BookingPaymentOrmEntity)
    private readonly payments: Repository<BookingPaymentOrmEntity>,
  ) {}

  async createCheckout(input: {
    studentId: number;
    instructorId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) {
    const booking = await this.commandBus.execute(
      new CreateBookingCommand(
        input.studentId,
        input.instructorId,
        input.bookingDate,
        input.startTime,
        input.endTime,
        input.notes,
      ),
    );

    const payment = await this.payments.save(
      this.payments.create({
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: 'VND',
        status: BookingPaymentStatus.PENDING,
      }),
    );

    const paymentUrl = await this.vnpay.createPaymentUrl({
      orderId: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      description: `Thanh toan buoi hoc #${booking.id}`,
      returnUrl: this.getReturnUrl(),
    });

    await this.payments.update(payment.id, { transactionId: paymentUrl.transactionId });
    await this.bookings.update(booking.id, { payment_reference: String(payment.id) });

    return {
      bookingId: booking.id,
      paymentId: payment.id,
      amount: Number(payment.amount),
      paymentUrl: paymentUrl.paymentUrl,
    };
  }

  async processVnpayCallback(query: Record<string, string>) {
    const verification = await this.vnpay.verifyCallback({ query });
    const payment = await this.payments.findOne({
      where: { id: verification.orderId },
      relations: { booking: true },
    });

    if (!payment || !payment.booking || Number(payment.amount) !== verification.amount) {
      this.logger.warn(`Rejected booking payment callback ${verification.orderId}`);
      return { bookingId: undefined, success: false };
    }

    if (payment.status === BookingPaymentStatus.PAID) {
      await this.dataSource.transaction((manager) =>
        this.recordBookingRevenue(manager, payment.booking!),
      );
      return { bookingId: payment.bookingId, success: true };
    }

    const success = verification.status === 'success';
    await this.dataSource.transaction(async (manager) => {
      const paymentRepo = manager.getRepository(BookingPaymentOrmEntity);
      const bookingRepo = manager.getRepository(BookingOrmEntity);

      await paymentRepo.update(payment.id, {
        status: success ? BookingPaymentStatus.PAID : BookingPaymentStatus.FAILED,
        transactionId: verification.transactionId || payment.transactionId,
        gatewayResponse: verification.rawResponse,
      });

      if (!success) {
        await bookingRepo.update(payment.bookingId, {
          status: BookingStatusEnum.CANCELLED,
          payment_status: BookingPaymentStatus.FAILED,
        });
        return;
      }

      await bookingRepo.update(payment.bookingId, {
        status: BookingStatusEnum.CONFIRMED,
        payment_status: BookingPaymentStatus.PAID,
      });
      await this.recordBookingRevenue(manager, payment.booking!);
      await this.meetingRooms.create(
        {
          bookingId: payment.bookingId,
          roomId: `booking-${payment.bookingId}`,
          status: MeetingRoomStatus.WAITING,
        },
        manager,
      );
    });

    return { bookingId: payment.bookingId, success };
  }

  private getReturnUrl(): string | undefined {
    const explicit = this.config.get<string>('VNP_BOOKING_RETURN_URL');
    if (explicit) return explicit;

    const defaultUrl = this.config.get<string>('VNP_RETURN_URL');
    return defaultUrl?.replace('/payments/webhook/vnpay', '/bookings/payment/vnpay');
  }

  private async recordBookingRevenue(
    manager: import('typeorm').EntityManager,
    booking: BookingOrmEntity,
  ): Promise<void> {
    await manager.query(
      `WITH profile AS (
         SELECT user_id, revenue_share_pct
         FROM instructor_profiles
         WHERE user_id = $2
         FOR UPDATE
       ), inserted AS (
         INSERT INTO revenue_splits (
           booking_id, order_item_id, instructor_id, course_id,
           gross_amount, platform_fee_pct, platform_fee_amount,
           instructor_share_pct, instructor_amount, coupon_discount,
           payout_status, created_at, updated_at
         )
         SELECT
           $1, NULL, user_id, NULL, $3,
           100 - revenue_share_pct,
           ROUND($3 * (100 - revenue_share_pct) / 100),
           revenue_share_pct,
           $3 - ROUND($3 * (100 - revenue_share_pct) / 100),
           0, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
         FROM profile
         ON CONFLICT (booking_id) WHERE booking_id IS NOT NULL DO NOTHING
         RETURNING instructor_id, instructor_amount
       )
       UPDATE instructor_profiles p
       SET total_earned = p.total_earned + i.instructor_amount,
           pending_payout = p.pending_payout + i.instructor_amount,
           updated_at = CURRENT_TIMESTAMP
       FROM inserted i
       WHERE p.user_id = i.instructor_id`,
      [booking.id, booking.instructor_id, Number(booking.total_amount)],
    );
  }
}
