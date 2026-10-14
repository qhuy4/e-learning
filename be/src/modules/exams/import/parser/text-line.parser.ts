import type { ImportRow } from '../exam-import.model';

/**
 * Heuristic line-based parser shared by the PDF and DOCX parsers.
 * It recognises common exam layouts:
 *
 *   Part 3                      -> section header
 *   Group 1                     -> group header
 *   Audio: https://...          -> material row
 *   1. What does the woman...?  -> question
 *   A. ... B. ... C. ... D. ... -> options
 *   Answer: B                   -> correct answer
 *   Explanation: ...             -> explanation
 *
 * Prose blocks become PASSAGE materials of the current group.
 */

const SECTION_RE = /^(part|section|module|unit|chapter)\s*[-–—]?\s*(?:\d+[a-z]?|[A-Z])(?![a-z0-9])/i;
const GROUP_RE = /^(group|nhóm|nhom)\s*[-–—]?\s*\d+/i;
const QUESTION_RE = /^\s*(\d{1,3})\s*[.、)]\s*(\S.*)$/;
const OPTION_RE = /^\s*([A-Fa-f])\s*[.、)]\s*(\S.*)$/;
const ANSWER_RE = /^\s*(?:answer|answers|đáp án|dap an|key)\s*[:\-–—]?\s*(\S.*)$/i;
const EXPLANATION_RE = /^\s*(?:explanation|giai thich|giải thích)\s*[:\-–—]?\s*(.*)$/i;
const TYPE_RE = /^\s*(?:question type|loai cau|loại câu|type)\s*[:\-–—]\s*([A-Za-z_ ]+)\s*$/i;
const MATERIAL_RE = /^(audio|image|ảnh|hình|transcript|material|tài liệu|tai lieu)\s*[:\-–—]\s*(.*)$/i;

const MIN_PROSE_LENGTH = 40;

interface CurrentQuestion {
  text: string;
  type: string;
  correct: string;
  explanation: string;
  options: Map<string, string>;
}

/** Extracts "Part 3" from lines like "Part 3: Direction ..." / "Part 3 - Listening". */
function headerName(line: string, matched: string): string {
  const sep = line.search(/[:：–—]|\s-\s/);
  if (sep > 0) return line.slice(0, sep).trim();
  return matched.replace(/\s+/g, ' ').trim();
}

export function parseTextToRows(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/);
  const rows: ImportRow[] = [];

  let section = '';
  let group: string | null = null;
  let prose: string[] = [];
  let question: CurrentQuestion | null = null;

  const flushProse = () => {
    const content = prose.join('\n').trim();
    prose = [];
    if (content.length < MIN_PROSE_LENGTH) return;
    if (!group) group = 'Group 1';
    rows.push({
      section,
      group: group ?? undefined,
      materialType: 'PASSAGE',
      materialContent: content,
    });
  };

  const flushQuestion = () => {
    if (!question) return;
    const q = question;
    question = null;
    if (!q.text.trim()) return;
    rows.push({
      section,
      group: group ?? undefined,
      question: q.text.trim(),
      questionType: q.type || undefined,
      optionA: q.options.get('A') ?? '',
      optionB: q.options.get('B') ?? '',
      optionC: q.options.get('C') ?? '',
      optionD: q.options.get('D') ?? '',
      correctAnswer: q.correct || undefined,
      explanation: q.explanation || undefined,
    });
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\u00a0/g, ' ').trim();
    if (!line) continue;

    // Section header
    const sm = line.match(SECTION_RE);
    if (sm) {
      flushQuestion();
      flushProse();
      section = headerName(line, sm[0]);
      group = null;
      continue;
    }

    // Group header
    const gm = line.match(GROUP_RE);
    if (gm) {
      flushQuestion();
      flushProse();
      group = headerName(line, gm[0]);
      continue;
    }

    // Material line ("Audio: ...", "Image: ...", "Transcript: ...")
    const mm = line.match(MATERIAL_RE);
    if (mm) {
      flushQuestion();
      flushProse();
      const kind = mm[1].toLowerCase();
      const materialType = kind.startsWith('audio')
        ? 'AUDIO'
        : kind.startsWith('image') || kind.startsWith('ảnh') || kind.startsWith('hình')
          ? 'IMAGE'
          : 'TEXT';
      if (!group) group = 'Group 1';
      rows.push({ section, group, materialType, materialContent: mm[2].trim() });
      continue;
    }

    // Question (numbered)
    const qm = line.match(QUESTION_RE);
    if (qm) {
      flushQuestion();
      flushProse();
      question = { text: qm[2], type: '', correct: '', explanation: '', options: new Map() };
      continue;
    }

    // Option letter (only while a question is open)
    const om = line.match(OPTION_RE);
    if (om && question) {
      const letter = om[1].toUpperCase();
      question.options.set(letter, om[2].trim());
      continue;
    }

    // Answer / Explanation / Type lines
    if (question) {
      const am = line.match(ANSWER_RE);
      if (am) {
        question.correct = am[1].trim();
        continue;
      }
      const em = line.match(EXPLANATION_RE);
      if (em) {
        question.explanation = em[1].trim();
        continue;
      }
      const tm = line.match(TYPE_RE);
      if (tm) {
        question.type = tm[1].trim().replace(/\s+/g, '_').toUpperCase();
        continue;
      }
    }

    // Free text
    if (question) {
      if (question.options.size > 0) {
        // Question already has options: a long line starts new prose, short junk is dropped.
        flushQuestion();
        prose.push(line);
      } else {
        question.text = `${question.text} ${line}`.trim();
      }
    } else {
      prose.push(line);
    }
  }

  flushQuestion();
  flushProse();
  return rows;
}
