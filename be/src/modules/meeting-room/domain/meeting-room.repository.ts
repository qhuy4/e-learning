import { MeetingRoomOrmEntity } from '@/modules/bookings/infrastructure/entity/meeting-room.orm-entity';

export abstract class MeetingRoomRepository {
  abstract findByIdWithBooking(
    id: number,
  ): Promise<MeetingRoomOrmEntity | null>;
}
