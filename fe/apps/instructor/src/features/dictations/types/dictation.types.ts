export enum DictationLevel {
  BEGINNER = 'BEGINNER',
  ELEMENTARY = 'ELEMENTARY',
  INTERMEDIATE = 'INTERMEDIATE',
  UPPER_INTERMEDIATE = 'UPPER_INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export interface DictationSentence {
  id?: string;
  dictationId?: string;
  sentence: string;
  startTime: number;
  endTime: number;
  position: number;
  hint?: string | null;
}

export interface Dictation {
  id?: string;
  title: string;
  description?: string | null;
  audioUrl: string;
  level: DictationLevel;
  playLimit?: number | null;
  sentences?: DictationSentence[];
}