export class RejectCourseCommand {
  constructor(
    public readonly id: number,
    public readonly reviewerId: number,
    public readonly reason?: string,
  ) {}
}
