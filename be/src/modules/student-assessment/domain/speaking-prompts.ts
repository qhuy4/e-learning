import { randomInt } from 'node:crypto';
import {
  ListeningLevel,
  LISTENING_LEVELS,
} from '@/modules/student-assessment/domain/listening-assessment';

export interface SpeakingPrompt {
  id: string;
  level: ListeningLevel;
  title: string;
  prompt: string;
  preparationSeconds: number;
  responseSeconds: number;
  guided: boolean;
}

const PROMPTS: SpeakingPrompt[] = [
  [
    'prea1-intro',
    'pre-A1',
    'Introduce yourself',
    'Read these words: name, home, like. Then say: My name is ___. I live in ___. I like ___.',
    15,
    30,
  ],
  [
    'prea1-room',
    'pre-A1',
    'Introduce yourself',
    'Read these words: hello, name, family. Then say: Hello. My name is ___. This is my family.',
    15,
    30,
  ],
  [
    'a1-day',
    'A1',
    'Introduce yourself',
    'Read these words: school, hobby, family. Then introduce yourself in 3 short sentences: your name, where you study or work, and one hobby.',
    20,
    40,
  ],
  [
    'a1-person',
    'A1',
    'Introduce yourself',
    'Read these words: friend, music, weekend. Then say your name and talk about one thing you like doing at the weekend.',
    20,
    40,
  ],
  [
    'a2-weekend',
    'A2',
    'Introduce yourself',
    'Read these words: favourite, experience, future. Then introduce yourself and say what you enjoy learning and one goal for the future.',
    20,
    45,
  ],
  [
    'a2-place',
    'A2',
    'Introduce yourself',
    'Read these words: hometown, interesting, improve. Then introduce yourself, describe your hometown briefly, and say why you learn English.',
    20,
    45,
  ],
  [
    'b1-learning',
    'B1',
    'Introduce yourself',
    'Read these words: confident, communication, experience. Then introduce yourself for about 45 seconds: your background, interests, and why you want to improve English.',
    25,
    55,
  ],
  [
    'b1-travel',
    'B1',
    'Introduce yourself',
    'Read these words: achievement, challenge, opportunity. Then introduce yourself and mention one achievement or challenge that is important to you.',
    25,
    55,
  ],
  [
    'b2-remote',
    'B2',
    'Remote work and study',
    'Discuss one benefit and one drawback of working or studying remotely, then give your opinion.',
    30,
    75,
  ],
  [
    'b2-city',
    'B2',
    'Improving your city',
    'Propose one change that would improve life in your city. Explain its benefits and possible challenges.',
    30,
    75,
  ],
  [
    'c1-technology',
    'C1',
    'Technology and attention',
    'Evaluate how digital technology affects attention. Consider different viewpoints and reach a conclusion.',
    45,
    90,
  ],
  [
    'c1-education',
    'C1',
    'What education should measure',
    'Discuss whether examinations measure the abilities society needs. Support your position with examples.',
    45,
    90,
  ],
  [
    'c2-progress',
    'C2',
    'Defining progress',
    'Examine the idea that technological progress necessarily improves human wellbeing. Address ambiguity and counterarguments.',
    45,
    90,
  ],
  [
    'c2-language',
    'C2',
    'Language and power',
    'Analyse how language can include or exclude people in institutions, and discuss whether regulation is an effective response.',
    45,
    90,
  ],
].map(([id, level, title, prompt, preparationSeconds, responseSeconds]) => ({
  id: String(id),
  level: level as ListeningLevel,
  title: String(title),
  prompt: String(prompt),
  preparationSeconds: Number(preparationSeconds),
  responseSeconds: Number(responseSeconds),
  guided: ['pre-A1', 'A1', 'A2', 'B1'].includes(String(level)),
}));

export function speakingPrompt(level: ListeningLevel): SpeakingPrompt {
  const candidates = PROMPTS.filter((item) => item.level === level);
  return candidates[randomInt(candidates.length)];
}

export function speakingPromptById(id: string): SpeakingPrompt | null {
  return PROMPTS.find((item) => item.id === id) ?? null;
}

if (
  new Set(PROMPTS.map((item) => item.level)).size !== LISTENING_LEVELS.length
) {
  throw new Error('Speaking prompt bank must cover every assessment level');
}
