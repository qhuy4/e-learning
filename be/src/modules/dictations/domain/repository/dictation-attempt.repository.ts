import { DictationAttemptOrmEntity } from '@/modules/dictations/infrastructure/entity/dictation-attempt.orm-entity';

export const DICTATION_ATTEMPT_REPOSITORY = 'DICTATION_ATTEMPT_REPOSITORY';
export interface IDictationAttemptRepository {
  create(
    attempt: Partial<DictationAttemptOrmEntity>,
  ): Promise<DictationAttemptOrmEntity>;
  update(
    id: number,
    attempt: Partial<DictationAttemptOrmEntity>,
  ): Promise<DictationAttemptOrmEntity | null>;
  findById(id: number): Promise<DictationAttemptOrmEntity | null>;
}
