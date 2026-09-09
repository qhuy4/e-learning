export class ApproveCourseCommand {
  constructor(
    public readonly id: number,
    public readonly reviewerId: number,
  ) {}
}
