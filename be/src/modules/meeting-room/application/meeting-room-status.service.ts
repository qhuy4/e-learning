import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { MeetingRoomRepositoryImpl } from '@/modules/meeting-room/infrastructure/repository/meeting-room.repository';

const SWEEP_INTERVAL_MS = 30_000;

@Injectable()
export class MeetingRoomStatusService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly meetingRoomRepository: MeetingRoomRepositoryImpl,
  ) {}

  onModuleInit() {
    void this.sweep();
    this.timer = setInterval(() => {
      void this.sweep();
    }, SWEEP_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private sweep() {
    this.meetingRoomRepository.endExpiredRooms().catch((error) => {
      console.error('Meeting room status sweep failed:', error);
    });
  }
}
