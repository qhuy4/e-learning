export const DICTATION_SENTENCE_REPOSITORY = 'DICTATION_SENTENCE_REPOSITORY';
export interface IDictationSentenceRepository {
  findByDictationId(dictationId: number): Promise<any[]>;
  saveAll(sentences: any[]): Promise<any[]>;
  deleteAllByDictationId(dictationId: number): Promise<void>;
}
