export class CreateDictationCommand {
  constructor(
    public readonly dto: any,
    public readonly createdBy: string,
    public readonly audio?: Express.Multer.File,
  ) {}
}
