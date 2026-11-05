export class DeleteLessonNoteCommand {
  constructor(
    public readonly userId: number,
    public readonly noteId: number,
  ) {}
}
