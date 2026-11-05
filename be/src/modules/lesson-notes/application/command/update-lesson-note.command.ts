export class UpdateLessonNoteCommand {
  constructor(
    public readonly userId: number,
    public readonly noteId: number,
    public readonly content: string,
  ) {}
}
