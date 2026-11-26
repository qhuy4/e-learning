import { BookingCheckoutService } from './booking-checkout.service';
import { EntityManager } from 'typeorm';
import { BookingOrmEntity } from '@/modules/bookings/infrastructure/entity/booking.orm-entity';

describe('BookingCheckoutService revenue', () => {
  it('records a booking split with an idempotent insert', async () => {
    const query = jest.fn().mockResolvedValue([]);
    const service = new BookingCheckoutService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    // Private money-path helper is exercised directly to keep this unit test small.

    const recordBookingRevenue = (
      service as unknown as {
        recordBookingRevenue: (
          manager: EntityManager,
          booking: BookingOrmEntity,
        ) => Promise<void>;
      }
    ).recordBookingRevenue.bind(service);

    await recordBookingRevenue(
      { query } as unknown as EntityManager,

      { id: 7, instructor_id: 71, total_amount: 160000 } as BookingOrmEntity,
    );

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining(
        'ON CONFLICT (booking_id) WHERE booking_id IS NOT NULL DO NOTHING',
      ),
      [7, 71, 160000, 0],
    );
  });
});
