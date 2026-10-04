import { Module } from '@nestjs/common';
import { LiveKitModule } from '@/modules/meeting-room/infrastructure/livekit/livekit.module';
import { MeetingRoomController } from '@/modules/meeting-room/presentation/meeting-room.controller';
import { JoinMeetingRoomHandler } from '@/modules/meeting-room/application/command-handler/join-meeting.handler';
import { MeetingRoomStatusService } from '@/modules/meeting-room/application/meeting-room-status.service';
import { MeetingRoomRepositoryImpl } from '@/modules/meeting-room/infrastructure/repository/meeting-room.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingRoomOrmEntity } from '@/modules/bookings/infrastructure/entity/meeting-room.orm-entity';

const CommandHandle = [];
const QueryHandle = [JoinMeetingRoomHandler];
@Module({
  controllers: [MeetingRoomController],
  imports: [
    LiveKitModule,
    TypeOrmModule.forFeature([MeetingRoomOrmEntity]),
  ],
  providers: [
    MeetingRoomRepositoryImpl,
    MeetingRoomStatusService,
    ...CommandHandle, ...QueryHandle],
})
export class MeetingRoomModule {}
