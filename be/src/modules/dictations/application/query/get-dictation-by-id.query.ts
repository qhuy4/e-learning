import { Dictation } from '@/modules/dictations/domain/entity/dictation.entity';
import { DictationSentenceOrmEntity } from '@/modules/dictations/infrastructure/entity/dictation-sentence.orm-entity';

/** Dictation kèm danh sách câu thực hành — kết quả của GetDictationByIdQuery. */
export type DictationDetail = Dictation & {
  sentences: DictationSentenceOrmEntity[];
};

export class GetDictationByIdQuery {
  constructor(public readonly id: string) {}
}
