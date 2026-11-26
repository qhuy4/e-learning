import { UpdateBookingStatusHandler } from './update-booking-status.handler';
import { UpdateBookingStatusCommand } from '@/modules/bookings/application/command/update-booking-status.command';
import { BookingStatusEnum } from '@/modules/bookings/domain/enum/booking-status.enum';
import { BookingPaymentStatus } from '@/modules/bookings/domain/enum/booking-payment-status.enum';

describe('UpdateBookingStatusHandler rejection voucher', () => {
  it('creates and emails a duration-limited voucher on instructor rejection', async () => {
    const couponRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const manager = {
      getRepository: jest.fn().mockReturnValue(couponRepository),
    };
    const dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    };
    const bookingRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 42,
        studentId: 7,
        studentEmail: 'student@example.com',
        instructorId: 9,
        startTime: '09:00:00',
        endTime: '10:00:00',
        status: BookingStatusEnum.PENDING,
        paymentStatus: BookingPaymentStatus.PENDING,
      }),
      updateStatus: jest.fn().mockResolvedValue({ id: 42 }),
    };
    const mailService = { sendHtml: jest.fn().mockResolvedValue(undefined) };
    const handler = new UpdateBookingStatusHandler(
      dataSource as never,
      bookingRepository as never,
      {} as never,
      mailService as never,
    );

    await handler.execute(
      new UpdateBookingStatusCommand(42, BookingStatusEnum.CANCELLED, true),
    );

    expect(couponRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'REBOOK42',
        discountValue: '100',
        recipientUserId: '7',
        maxBookingMinutes: 60,
      }),
    );
    expect(mailService.sendHtml).toHaveBeenCalledWith(
      'student@example.com',
      expect.any(String),
      expect.stringContaining('60 phút'),
    );
  });
});
