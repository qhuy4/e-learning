import { Module } from '@nestjs/common';
import { LiveKitService } from '@/modules/meeting-room/infrastructure/livekit/service/livekit.service';

@Module({
  providers: [LiveKitService],
  exports: [LiveKitService],
})
export class LiveKitModule {}
