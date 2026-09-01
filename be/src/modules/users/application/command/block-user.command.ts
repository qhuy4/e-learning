export class BlockUserCommand {
  constructor(public readonly data: { id: number; reason: string }) {}
}
