export class UpdateDictationCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly dto: any,
    public readonly audio?: Express.Multer.File,
  ) {}
}
