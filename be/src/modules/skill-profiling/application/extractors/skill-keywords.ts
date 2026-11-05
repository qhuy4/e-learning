/**
 * Keyword heuristic: ánh xạ text (tên khóa học / bài học) sang skill code
 * NGÔN NGỮ. Không có cột skill trên courses/lessons nên dùng matching theo
 * từ khóa — giữ trong code (không cần bảng mapping admin).
 */

export const TOPIC_SKILL_KEYWORDS: Record<string, string[]> = {
  grammar: ['grammar', 'ngữ pháp'],
  vocabulary: ['vocabulary', 'vocab', 'từ vựng'],
  speaking: [
    'speaking',
    'conversation',
    'conversational',
    'giao tiếp',
    'luyện nói',
  ],
  listening: ['listening', 'nghe'],
  writing: ['writing', 'essay', 'viết'],
  pronunciation: ['pronunciation', 'phonetics', 'phát âm'],
};

/** Skill nhận evidence khi text không khớp chủ đề nào. */
export const FALLBACK_SKILL = {
  STUDENT_RATING: 'instructional_clarity',
  STUDENT_OUTCOME: 'student_engagement',
} as const;

const isAsciiWord = (kw: string) => /^[a-z0-9]+$/.test(kw);

const compiled: Array<{
  code: string;
  regexes: RegExp[];
  substrings: string[];
}> = Object.entries(TOPIC_SKILL_KEYWORDS).map(([code, keywords]) => ({
  code,
  regexes: keywords
    .filter(isAsciiWord)
    .map((kw) => new RegExp(`(^|[^a-z0-9])${kw}([^a-z0-9]|$)`, 'i')),
  substrings: keywords.filter((kw) => !isAsciiWord(kw)),
}));

/** Trả về skill code đầu tiên khớp, hoặc null nếu không khớp skill chủ đề nào. */
export function matchTopicSkill(
  text: string | null | undefined,
): string | null {
  if (!text) return null;
  const t = text.toLowerCase();
  for (const { code, regexes, substrings } of compiled) {
    if (regexes.some((re) => re.test(t))) return code;
    if (substrings.some((kw) => t.includes(kw))) return code;
  }
  return null;
}
