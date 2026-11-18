import { DictationSentenceOrmEntity } from '@/modules/dictations/infrastructure/entity/dictation-sentence.orm-entity';

export const DICTATION_SENTENCE_REPOSITORY = 'DICTATION_SENTENCE_REPOSITORY';
export interface IDictationSentenceRepository {
  findByDictationId(dictationId: number): Promise<DictationSentenceOrmEntity[]>;
  saveAll(
    sentences: Partial<DictationSentenceOrmEntity>[],
  ): Promise<Partial<DictationSentenceOrmEntity>[]>;
  deleteAllByDictationId(dictationId: number): Promise<void>;
}
