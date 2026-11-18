import { DictationInput } from '../dictation-input.interface';

export class CreateDictationCommand {
  constructor(
    public readonly dto: DictationInput,
    public readonly createdBy: string,
    public readonly audio?: Express.Multer.File,
  ) {}
}
