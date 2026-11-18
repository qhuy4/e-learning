import { DictationAnswerInput } from '../dictation-input.interface';

export class SubmitDictationCommand {
  constructor(
    public readonly attemptId: string,
    public readonly userId: string,
    public readonly answers: DictationAnswerInput[],
  ) {}
}
