import { Dictation } from '../entity/dictation.entity';
export const DICTATION_REPOSITORY = 'DICTATION_REPOSITORY';
export interface IDictationRepository {
  create(dictation: Dictation): Promise<Dictation>;
  update(id: number, dictation: Partial<Dictation>): Promise<Dictation | null>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Dictation | null>;
  findByCreator(userId: number): Promise<Dictation[]>;
  findAll(): Promise<Dictation[]>;
}
