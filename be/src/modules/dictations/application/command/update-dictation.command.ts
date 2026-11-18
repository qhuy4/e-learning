import { DictationInput } from '../dictation-input.interface';

export class UpdateDictationCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly dto: DictationInput,
    public readonly audio?: Express.Multer.File,
  ) {}
}
