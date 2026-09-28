export class JoinMeetingRoomCommand {
  constructor(
    public readonly meetingRoomId: number,
    public readonly userId: number,
  ) {}
}
