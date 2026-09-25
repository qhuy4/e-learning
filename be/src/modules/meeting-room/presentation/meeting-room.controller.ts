import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JoinMeetingRoomCommand } from '@/modules/meeting-room/application/command/join-meeting.command';

@Controller('meeting')
@UseGuards(JwtAuthGuard)
export class MeetingRoomController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @Post(':id/join')
  join(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.commandBus.execute(new JoinMeetingRoomCommand(id, userId));
  }
}
