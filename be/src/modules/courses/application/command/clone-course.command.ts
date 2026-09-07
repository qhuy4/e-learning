export class CloneCourseCommand {
  constructor(
    public readonly courseId: number,
    public readonly instructorId: number,
  ) {}
}
