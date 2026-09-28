export const DICTATION_ATTEMPT_REPOSITORY = 'DICTATION_ATTEMPT_REPOSITORY';
export interface IDictationAttemptRepository {
  create(attempt: any): Promise<any>;
  update(id: number, attempt: any): Promise<any>;
  findById(id: number): Promise<any>;
}
