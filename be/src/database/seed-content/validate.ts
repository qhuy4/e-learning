/**
 * seed-content/validate.ts — content integrity checks run BEFORE any wipe, so
 * a broken content file can never leave the database half-seeded.
 */
import {
  AUTO_GRADABLE_TYPES,
  SeedExam,
  SeedGroup,
  SeedQuestion,
  countExamQuestions,
  countSectionQuestions,
} from './types';

const GRADABLE = new Set<string>(AUTO_GRADABLE_TYPES);

/** Tiny assertion used by content files to pin down per-part counts. */
export function expectCount(label: string, actual: number, expected: number): void {
  if (actual !== expected) {
    throw new Error(`[seed-content] ${label}: expected ${expected}, got ${actual}`);
  }
}

function validateQuestion(examTitle: string, label: string, question: SeedQuestion): void {
  const type = question.type ?? 'MULTIPLE_CHOICE';
  if (!question.q || !question.q.trim()) {
    throw new Error(`[seed-content] ${examTitle} — ${label}: empty question stem`);
  }
  if (!question.explanation || !question.explanation.trim()) {
    throw new Error(`[seed-content] ${examTitle} — ${label}: empty explanation`);
  }
  if (GRADABLE.has(type)) {
    const options = question.options ?? [];
    if (options.length < 3) {
      throw new Error(
        `[seed-content] ${examTitle} — ${label}: ${type} needs at least 3 options, got ${options.length}`,
      );
    }
    if (options.some((o) => !o || !o.trim())) {
      throw new Error(`[seed-content] ${examTitle} — ${label}: empty option`);
    }
    if (
      question.answer === undefined ||
      !Number.isInteger(question.answer) ||
      question.answer < 0 ||
      question.answer >= options.length
    ) {
      throw new Error(
        `[seed-content] ${examTitle} — ${label}: missing/invalid answer index for ${type}`,
      );
    }
  } else if (question.options || question.answer !== undefined) {
    throw new Error(
      `[seed-content] ${examTitle} — ${label}: ${type} must not carry options`,
    );
  } else if (question.answers) {
    if (question.answers.length === 0) {
      throw new Error(
        `[seed-content] ${examTitle} — ${label}: answers must not be empty (omit the field instead)`,
      );
    }
    if (question.answers.some((a) => !a || !a.trim())) {
      throw new Error(`[seed-content] ${examTitle} — ${label}: empty answer key`);
    }
    if (question.answers.some((a) => a.includes('/'))) {
      throw new Error(
        `[seed-content] ${examTitle} — ${label}: answer keys must not contain "/" (the FE joins alternatives with it)`,
      );
    }
  }
}

function validateGroup(examTitle: string, label: string, group: SeedGroup): void {
  if (!group.questions || group.questions.length === 0) {
    throw new Error(`[seed-content] ${examTitle} — ${label}: group without questions`);
  }
  for (const material of group.materials ?? []) {
    const hasBody =
      (material.content && material.content.trim()) ||
      (material.transcript && material.transcript.trim()) ||
      (material.fileUrl && material.fileUrl.trim());
    if (!hasBody) {
      throw new Error(
        `[seed-content] ${examTitle} — ${label}: material without content/transcript/fileUrl`,
      );
    }
  }
  group.questions.forEach((question, i) =>
    validateQuestion(examTitle, `${label} q${i + 1}`, question),
  );
}

/** Full validation of one exam definition — throws with a precise message. */
export function validateExamContent(exam: SeedExam): void {
  const stems = new Map<string, number>();

  exam.sections.forEach((section, si) => {
    (section.questions ?? []).forEach((question, qi) => {
      const label = `section "${section.name}" direct q${qi + 1}`;
      validateQuestion(exam.title, label, question);
      const stem = question.q.trim().replace(/\s+/g, ' ');
      const seen = stems.get(stem);
      if (seen !== undefined) {
        throw new Error(
          `[seed-content] ${exam.title} — duplicate stem #${seen + 1} & ${label}: "${stem.slice(0, 70)}…"`,
        );
      }
      stems.set(stem, si * 10000 + qi);
    });

    (section.groups ?? []).forEach((group, gi) => {
      const label = `section "${section.name}" group ${gi + 1}${group.title ? ` (${group.title})` : ''}`;
      validateGroup(exam.title, label, group);
      group.questions.forEach((question, qi) => {
        const stem = question.q.trim().replace(/\s+/g, ' ');
        const seen = stems.get(stem);
        if (seen !== undefined) {
          throw new Error(
            `[seed-content] ${exam.title} — duplicate stem #${seen + 1} & ${label} q${qi + 1}: "${stem.slice(0, 70)}…"`,
          );
        }
        stems.set(stem, si * 10000 + gi * 100 + qi);
      });
    });
  });

  const total = countExamQuestions(exam);
  if (total !== exam.expectTotalQuestions) {
    throw new Error(
      `[seed-content] ${exam.title}: expected ${exam.expectTotalQuestions} questions, got ${total}`,
    );
  }
  for (const section of exam.sections) {
    const expected = exam.expectSectionQuestions[section.name];
    if (expected === undefined) {
      throw new Error(
        `[seed-content] ${exam.title}: section "${section.name}" missing from expectSectionQuestions`,
      );
    }
    const actual = countSectionQuestions(section);
    if (actual !== expected) {
      throw new Error(
        `[seed-content] ${exam.title}: section "${section.name}" expected ${expected} questions, got ${actual}`,
      );
    }
  }
}
