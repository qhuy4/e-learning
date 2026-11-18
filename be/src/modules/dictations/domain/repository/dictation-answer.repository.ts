import { DictationAnswerOrmEntity } from '@/modules/dictations/infrastructure/entity/dictation-answer.orm-entity';

export const DICTATION_ANSWER_REPOSITORY = 'DICTATION_ANSWER_REPOSITORY';
export interface IDictationAnswerRepository {
  saveAll(
    answers: Partial<DictationAnswerOrmEntity>[],
  ): Promise<Partial<DictationAnswerOrmEntity>[]>;
}
