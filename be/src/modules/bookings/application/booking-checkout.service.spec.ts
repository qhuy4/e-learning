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
    );

    // Private money-path helper is exercised directly to keep this unit test small.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const recordBookingRevenue = (
      service as unknown as {
        recordBookingRevenue: (
          manager: EntityManager,
          booking: BookingOrmEntity,
        ) => Promise<void>;
      }
    ).recordBookingRevenue.bind(service);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await recordBookingRevenue(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      { query } as unknown as EntityManager,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      { id: 7, instructor_id: 71, total_amount: 160000 } as BookingOrmEntity,
    );

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining(
        'ON CONFLICT (booking_id) WHERE booking_id IS NOT NULL DO NOTHING',
      ),
      [7, 71, 160000],
    );
  });
});
