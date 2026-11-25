import { randomInt } from 'node:crypto';
import bankData from './listening-bank.json';

export const LISTENING_FORM_VERSION_PREFIX = 'listening-level-v2';

export const LISTENING_LEVELS = [
  'pre-A1',
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
] as const;

export type ListeningLevel = (typeof LISTENING_LEVELS)[number];
type BankItem = [string, string, string[], number];
type WordItem = [string, string, string[], number];

interface ListeningTest {
  id: string;
  level: ListeningLevel;
  title: string;
  audioUrl: string;
  transcript: string;
  items: BankItem[];
}

interface ListeningBank {
  source: {
    title: string;
    author: string;
    contentOrigin: string;
    frameworkTitle: string;
    frameworkUrl: string;
    alignmentNote: string;
    license: string;
  };
  tests: ListeningTest[];
}

const BANK = bankData as ListeningBank;

const WORD_BANK: Record<ListeningLevel, WordItem[]> = {
  'pre-A1': [
    ['prea1-word-book', 'book', ['book', 'ball', 'bag', 'box'], 0],
    ['prea1-word-cat', 'cat', ['cap', 'car', 'cat', 'cup'], 2],
    ['prea1-word-red', 'red', ['read', 'red', 'rain', 'road'], 1],
    ['prea1-word-three', 'three', ['tree', 'two', 'three', 'ten'], 2],
  ],
  A1: [
    [
      'a1-word-family',
      'family',
      ['family', 'friendly', 'famous', 'finally'],
      0,
    ],
    [
      'a1-word-morning',
      'morning',
      ['meeting', 'morning', 'moving', 'Monday'],
      1,
    ],
    ['a1-word-school', 'school', ['store', 'sport', 'school', 'street'], 2],
    ['a1-word-water', 'water', ['weather', 'winter', 'water', 'waiter'], 2],
  ],
  A2: [
    [
      'a2-word-appointment',
      'appointment',
      ['apartment', 'appointment', 'agreement', 'announcement'],
      1,
    ],
    [
      'a2-word-library',
      'library',
      ['laboratory', 'library', 'luggage', 'gallery'],
      1,
    ],
    [
      'a2-word-weekend',
      'weekend',
      ['weekday', 'welcome', 'weekend', 'weather'],
      2,
    ],
    [
      'a2-word-vegetable',
      'vegetable',
      ['comfortable', 'valuable', 'vegetable', 'available'],
      2,
    ],
  ],
  B1: [
    [
      'b1-word-volunteer',
      'volunteer',
      ['volunteer', 'engineer', 'visitor', 'employee'],
      0,
    ],
    ['b1-word-journey', 'journey', ['journal', 'journey', 'July', 'jury'], 1],
    [
      'b1-word-improve',
      'improve',
      ['approve', 'improve', 'include', 'involve'],
      1,
    ],
    [
      'b1-word-experience',
      'experience',
      ['experiment', 'experience', 'explanation', 'expression'],
      1,
    ],
  ],
  B2: [
    [
      'b2-word-collaboration',
      'collaboration',
      ['celebration', 'collaboration', 'calculation', 'communication'],
      1,
    ],
    [
      'b2-word-sustainable',
      'sustainable',
      ['suitable', 'sustainable', 'substantial', 'sensitive'],
      1,
    ],
    [
      'b2-word-productivity',
      'productivity',
      ['production', 'productive', 'productivity', 'probability'],
      2,
    ],
    [
      'b2-word-perspective',
      'perspective',
      ['prospective', 'perspective', 'protective', 'respective'],
      1,
    ],
  ],
  C1: [
    [
      'c1-word-inevitable',
      'inevitable',
      ['invaluable', 'inevitable', 'invisible', 'innovative'],
      1,
    ],
    [
      'c1-word-ambiguous',
      'ambiguous',
      ['ambitious', 'ambiguous', 'anonymous', 'analogous'],
      1,
    ],
    [
      'c1-word-implication',
      'implication',
      ['application', 'implication', 'implementation', 'explanation'],
      1,
    ],
    [
      'c1-word-controversial',
      'controversial',
      ['conventional', 'controversial', 'conversational', 'considerable'],
      1,
    ],
  ],
  C2: [
    [
      'c2-word-ubiquitous',
      'ubiquitous',
      ['ambiguous', 'ubiquitous', 'iniquitous', 'unanimous'],
      1,
    ],
    [
      'c2-word-nuanced',
      'nuanced',
      ['nuisance', 'nuanced', 'neutral', 'notable'],
      1,
    ],
    [
      'c2-word-paradigm',
      'paradigm',
      ['paragraph', 'paradigm', 'paradox', 'parameter'],
      1,
    ],
    [
      'c2-word-scrutinise',
      'scrutinise',
      ['standardise', 'scrutinise', 'summarise', 'synchronise'],
      1,
    ],
  ],
};

interface ParsedListeningForm {
  test: ListeningTest;
  words: WordItem[];
}

function formFromVersion(version: string): ParsedListeningForm | null {
  const prefix = `${LISTENING_FORM_VERSION_PREFIX}:`;
  if (!version.startsWith(prefix)) return null;
  const [testId, ...wordIds] = version.slice(prefix.length).split(':');
  const test = BANK.tests.find((item) => item.id === testId);
  if (!test) return null;
  const levelWords = WORD_BANK[test.level];
  const words = wordIds
    .map((id) => levelWords.find((item) => item[0] === id))
    .filter((item): item is WordItem => item != null);
  if (wordIds.length > 0 && words.length !== wordIds.length) return null;
  return { test, words };
}

export function isListeningLevel(value: string): value is ListeningLevel {
  return LISTENING_LEVELS.includes(value as ListeningLevel);
}

export function listeningForm(level: ListeningLevel, variant?: number) {
  const candidates = BANK.tests.filter((test) => test.level === level);
  const index =
    variant == null
      ? randomInt(candidates.length)
      : Math.abs(variant) % candidates.length;
  const test = candidates[index];
  const wordCandidates = [...WORD_BANK[level]];
  const words: WordItem[] = [];
  while (words.length < 2 && wordCandidates.length > 0) {
    const wordIndex =
      variant == null
        ? randomInt(wordCandidates.length)
        : Math.abs(variant + words.length) % wordCandidates.length;
    words.push(wordCandidates.splice(wordIndex, 1)[0]);
  }

  return {
    version: `${LISTENING_FORM_VERSION_PREFIX}:${test.id}:${words.map(([id]) => id).join(':')}`,
    level,
    instructions:
      'Nghe từng từ, sau đó nghe một đoạn ngắn và chọn đáp án đúng nhất. Bạn có thể nghe lại khi cần. Đây là bài kiểm tra nhanh, không phải chứng nhận CEFR.',
    source: BANK.source,
    groups: [
      ...words.map(([itemId, speechText, options]) => ({
        groupId: itemId,
        kind: 'word' as const,
        title: 'Nghe và chọn từ',
        speechText,
        audioUrl: null,
        items: [
          {
            itemId,
            question: 'Bạn nghe thấy từ nào?',
            options,
          },
        ],
      })),
      {
        groupId: test.id,
        kind: 'passage' as const,
        title: test.title,
        speechText: test.transcript,
        audioUrl: test.audioUrl,
        items: test.items.map(([itemId, question, options]) => ({
          itemId,
          question,
          options,
        })),
      },
    ],
  };
}

export function isListeningForm(version: string): boolean {
  return formFromVersion(version) !== null;
}

export function isListeningItem(version: string, itemId: string): boolean {
  const form = formFromVersion(version);
  return (
    form?.test.items.some(([id]) => id === itemId) === true ||
    form?.words.some(([id]) => id === itemId) === true
  );
}

export function listeningLevelForVersion(
  version: string,
): ListeningLevel | null {
  return formFromVersion(version)?.test.level ?? null;
}

export function scoreListening(
  version: string,
  responses: Array<{ itemId: string; optionIndex: number }>,
) {
  const form = formFromVersion(version);
  if (!form) return null;

  const answers = new Map(
    [...form.words, ...form.test.items].map(([itemId, , , answerIndex]) => [
      itemId,
      answerIndex,
    ]),
  );
  let rawScore = 0;
  for (const response of responses) {
    if (answers.get(response.itemId) === response.optionIndex) rawScore += 1;
  }
  return {
    answered: responses.length,
    total: answers.size,
    rawScore,
    scorePct: Math.round((rawScore / answers.size) * 100),
  };
}
