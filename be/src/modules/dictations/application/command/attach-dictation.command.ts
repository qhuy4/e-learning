export class AttachDictationCommand {
  constructor(public readonly dictationId: string, public readonly lessonId: string, public readonly userId: string) {}
}
