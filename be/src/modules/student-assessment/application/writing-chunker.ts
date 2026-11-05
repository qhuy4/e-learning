/**
 * Chia bài viết thành các chunk ≤ maxWords từ.
 *
 * Model GEC có giới hạn max_input_tokens (128) — chấm cả bài dài sẽ chỉ
 * chấm phần đầu. Chunk theo câu rồi pack câu vào chunk ≤ maxWords; câu
 * dài hơn maxWords bị cắt cứng theo từ.
 *
 * charOffset = vị trí chunk trong bản trimmed gốc để Nest cộng vào
 * char_start/char_end của changes[] (model trả offset trong chunk).
 * Mỗi chunk được trim hai đầu whitespace — model strip() sẽ không làm
 * lệch offset.
 */

export interface WritingChunk {
  index: number;
  text: string;
  charOffset: number;
  wordCount: number;
}

const MAX_CHUNK_WORDS_DEFAULT = 120;

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

interface Span {
  start: number;
  end: number;
}

/** Cắt theo dấu kết thúc câu (.!?) — dấu được giữ lại trong span. */
function sentenceSpans(text: string): Span[] {
  const spans: Span[] = [];
  const re = /[.!?]+["')\]]*(?=\s|$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const end = m.index + m[0].length;
    if (end > last) {
      spans.push({ start: last, end });
      last = end;
    }
  }
  if (last < text.length) spans.push({ start: last, end: text.length });
  return spans.filter((s) => s.end > s.start);
}

/** Cắt cứng một span quá dài theo từ, giữ offset từng phần. */
function splitSpanByWords(span: Span, text: string, maxWords: number): Span[] {
  const parts: Span[] = [];
  const wordRe = /\S+/g;
  const words: Span[] = [];
  const slice = text.slice(span.start, span.end);
  let m: RegExpExecArray | null;
  while ((m = wordRe.exec(slice)) !== null) {
    words.push({ start: span.start + m.index, end: span.start + m.index + m[0].length });
  }
  for (let i = 0; i < words.length; i += maxWords) {
    const first = words[i];
    const last = words[Math.min(i + maxWords, words.length) - 1];
    parts.push({ start: first.start, end: last.end });
  }
  return parts.length > 0 ? parts : [span];
}

export function chunkWriting(
  text: string,
  maxWordsPerChunk: number = MAX_CHUNK_WORDS_DEFAULT,
): WritingChunk[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const rawSpans = sentenceSpans(trimmed).flatMap((span) => {
    const words = countWords(trimmed.slice(span.start, span.end));
    return words > maxWordsPerChunk
      ? splitSpanByWords(span, trimmed, maxWordsPerChunk)
      : [span];
  });

  const groups: Span[][] = [];
  let current: Span[] = [];
  let currentWords = 0;

  for (const span of rawSpans) {
    const words = countWords(trimmed.slice(span.start, span.end));
    if (current.length > 0 && currentWords + words > maxWordsPerChunk) {
      groups.push(current);
      current = [];
      currentWords = 0;
    }
    current.push(span);
    currentWords += words;
  }
  if (current.length > 0) groups.push(current);

  return groups.map((group, index) => {
    const start = group[0].start;
    const end = group[group.length - 1].end;
    const raw = trimmed.slice(start, end);
    const leading = raw.length - raw.trimStart().length;
    const chunkText = raw.trim();
    return {
      index,
      text: chunkText,
      charOffset: start + leading,
      wordCount: countWords(chunkText),
    };
  });
}

/** Tổng số từ theo cùng quy tắc split() phía Python (whitespace). */
export function countTotalWords(text: string): number {
  return countWords(text.trim());
}
