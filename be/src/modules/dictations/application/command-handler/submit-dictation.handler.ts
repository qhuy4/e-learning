import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubmitDictationCommand } from '../command/submit-dictation.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { IDictationAttemptRepository, DICTATION_ATTEMPT_REPOSITORY } from '../../domain/repository/dictation-attempt.repository';
import { IDictationAnswerRepository, DICTATION_ANSWER_REPOSITORY } from '../../domain/repository/dictation-answer.repository';
import { IDictationSentenceRepository, DICTATION_SENTENCE_REPOSITORY } from '../../domain/repository/dictation-sentence.repository';

@CommandHandler(SubmitDictationCommand)
export class SubmitDictationHandler implements ICommandHandler<SubmitDictationCommand> {
  constructor(
    @Inject(DICTATION_ATTEMPT_REPOSITORY) private attemptRepo: IDictationAttemptRepository,
    @Inject(DICTATION_ANSWER_REPOSITORY) private answerRepo: IDictationAnswerRepository,
    @Inject(DICTATION_SENTENCE_REPOSITORY) private sentenceRepo: IDictationSentenceRepository
  ) {}
  async execute(command: SubmitDictationCommand) {
    const attempt = await this.attemptRepo.findById(Number(command.attemptId));
    if (!attempt || attempt.userId !== command.userId) throw new NotFoundException();

    // Logic to check correctness would be here (omitted for brevity, we assume answers contains isCorrect or we calculate it)
    let correctCount = 0;
    const answerEntities = command.answers.map(ans => {
      const isCorrect = ans.isCorrect || false; // Simple logic placeholder
      if (isCorrect) correctCount++;
      return {
        attemptId: attempt.id,
        sentenceId: ans.sentenceId,
        answerText: ans.answerText,
        isCorrect,
        similarity: ans.similarity || 0
      };
    });

    await this.answerRepo.saveAll(answerEntities);

    const accuracy = command.answers.length > 0 ? (correctCount / command.answers.length) * 100 : 0;
    await this.attemptRepo.update(Number(attempt.id), { accuracy, submittedAt: new Date() });

    return { success: true, accuracy };
  }
}
