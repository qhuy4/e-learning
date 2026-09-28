export class StartDictationCommand {
  constructor(public readonly dictationId: string, public readonly userId: string) {}
}
