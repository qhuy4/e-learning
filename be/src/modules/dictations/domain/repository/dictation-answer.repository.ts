export const DICTATION_ANSWER_REPOSITORY = 'DICTATION_ANSWER_REPOSITORY';
export interface IDictationAnswerRepository {
  saveAll(answers: any[]): Promise<any[]>;
}
