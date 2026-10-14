import { Injectable } from '@nestjs/common';
import { ExamGroupType } from '../../domain/enums/exam-group-type.enum';
import { ExamMaterialType } from '../../domain/enums/exam-material-type.enum';
import { QuestionType } from '../../domain/enums/question-type.enum';
import type { ExamSection } from '../../domain/entity/exam-section.entity';
import type {
  ExamImportContext,
  ImportIssue,
  ImportSectionProgress,
  ImportValidationReport,
  NormalizedExamImport,
  NormalizedQuestion,
} from '../exam-import.model';
import { ExamTypeMapperRegistry } from '../mapper/exam-type.mapper';

const QUESTION_TYPES = new Set<string>(Object.values(QuestionType));
const GROUP_TYPES = new Set<string>(Object.values(ExamGroupType));
const MATERIAL_TYPES = new Set<string>(Object.values(ExamMaterialType));
const CHOICE_TYPES = new Set<string>([
  QuestionType.MULTIPLE_CHOICE,
  QuestionType.MULTI_SELECT,
  QuestionType.MATCHING,
]);

function sectionKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function questionTotal(section: {
  directQuestions: NormalizedQuestion[];
  groups: { questions: NormalizedQuestion[] }[];
}): number {
  return section.directQuestions.length + section.groups.reduce((n, g) => n + g.questions.length, 0);
}

function trunc(text: string): string {
  const t = text.trim();
  return t.length > 40 ? `${t.slice(0, 40)}…` : t;
}

/**
 * Validates a normalized import against the target exam:
 * required fields, question types, options/correct answers, group/material
 * relationships, section question counts (5/6, 6/6, 7/6), duplicate
 * positions and duplicate/missing questions.
 *
 * Save/Publish is only allowed when the report has no errors (canSave).
 */
@Injectable()
export class ExamImportValidator {
  constructor(private readonly mapperRegistry: ExamTypeMapperRegistry) {}

  validate(
    data: NormalizedExamImport,
    examSections: ExamSection[],
    ctx: ExamImportContext,
    preIssues: ImportIssue[] = [],
  ): ImportValidationReport {
    const issues: ImportIssue[] = [...preIssues];
    const err = (code: string, path: string, message: string) =>
      issues.push({ severity: 'error', code, path, message });
    const warn = (code: string, path: string, message: string) =>
      issues.push({ severity: 'warning', code, path, message });

    const mapper = this.mapperRegistry.resolve(ctx.examTypeName);
    const typeName = ctx.examTypeName ?? 'loại đề này';

    if (!data.sections || data.sections.length === 0) {
      err('IMPORT_EMPTY', '', 'File không có section nào — không có dữ liệu để import.');
    }

    const importByKey = new Map<string, { index: number; matched: boolean }>();
    data.sections.forEach((section, index) => {
      importByKey.set(sectionKey(section.name), { index, matched: false });
    });

    // ---------- section progress vs exam sections (canonical list) ----------
    const sortedExamSections = [...examSections].sort((a, b) => a.position - b.position);
    const progress: ImportSectionProgress[] = [];

    let matchedSections = 0;
    sortedExamSections.forEach((examSection, i) => {
      const path = `sections.${i}`;
      const hit = importByKey.get(sectionKey(examSection.name));
      if (!hit) {
        // Partial import: this section is not in the file — its current data stays untouched on save.
        return;
      }
      hit.matched = true;
      matchedSections += 1;
      const target = examSection.questionCount ?? null;
      const actual = this.importedCount(data.sections[hit.index]);
      const ok = target !== null && actual === target;
      progress.push({ sectionId: examSection.id, name: examSection.name, actual, target, ok });

      if (target !== null && actual !== target) {
        err(
          'SECTION_COUNT',
          path,
          `Phần "${examSection.name}" có ${actual}/${target} câu — phải đúng ${target} câu.`,
        );
      }
    });

    if (data.sections.length > 0 && matchedSections === 0) {
      err(
        'NO_SECTION_MATCH',
        '',
        'Không có phần thi nào trong file khớp với đề thi — cột "section" phải trùng tên phần thi (vd: Part 3, Reading), không phân biệt hoa/thường.',
      );
    }

    importByKey.forEach((entry, key) => {
      if (entry.matched) return;
      const section = data.sections[entry.index];
      progress.push({
        sectionId: null,
        name: section.name,
        actual: this.importedCount(section),
        target: null,
        ok: false,
      });
      err(
        'SECTION_UNKNOWN',
        `sections.${entry.index}`,
        `Phần "${section.name}" không khớp phần thi nào của đề thi (tên phải trùng tên phần thi, không phân biệt hoa/thường).`,
      );
      void key;
    });

    // ---------- per-section content checks ----------
    data.sections.forEach((section, si) => {
      const path = `sections.${si}`;
      if (!section.name.trim()) {
        err('SECTION_EMPTY', path, 'Section thiếu tên.');
      }

      const prefers =
        mapper?.prefersGrouped({ ...ctx, sectionName: section.name }) ?? null;
      if (prefers === true && section.directQuestions.length > 0) {
        err(
          'DIRECT_IN_GROUPED_SECTION',
          path,
          `Phần "${section.name}" của ${typeName} cần Group — có ${section.directQuestions.length} câu trực tiếp (kiểm tra cột "group").`,
        );
      }
      if (prefers === false && section.directQuestions.length === 0 && section.groups.length > 0) {
        warn(
          'GROUPED_IN_DIRECT_SECTION',
          path,
          `Phần "${section.name}" của ${typeName} nên dùng câu hỏi trực tiếp — dữ liệu đang nằm trong group.`,
        );
      }

      this.checkQuestions(section.directQuestions, `${path}.directQuestions`, err, warn);

      section.groups.forEach((group, gi) => {
        const groupPath = `${path}.groups.${gi}`;
        if (!GROUP_TYPES.has(group.groupType)) {
          err(
            'GROUP_TYPE_INVALID',
            groupPath,
            `Group "${group.name}" có group_type không hợp lệ "${group.groupType}" (chọn: ${Object.values(ExamGroupType).join(', ')}).`,
          );
        }
        if (!group.name.trim()) {
          warn('GROUP_NAME_EMPTY', groupPath, 'Group không có tên.');
        }
        if (group.questions.length === 0 && group.materials.length === 0) {
          warn('GROUP_EMPTY', groupPath, `Group "${group.name}" trống (không có câu hỏi, không có tài liệu).`);
        }
        if (
          group.questions.length > 0 &&
          group.materials.length === 0 &&
          (group.groupType === ExamGroupType.AUDIO || group.groupType === ExamGroupType.PASSAGE)
        ) {
          warn(
            'MATERIAL_MISSING',
            groupPath,
            `Group ${group.groupType} "${group.name}" chưa có tài liệu (${group.groupType === ExamGroupType.AUDIO ? 'audio' : 'passage'}).`,
          );
        }

        group.materials.forEach((material, mi) => {
          const materialPath = `${groupPath}.materials.${mi}`;
          if (!MATERIAL_TYPES.has(material.type)) {
            err(
              'MATERIAL_TYPE_INVALID',
              materialPath,
              `material_type không hợp lệ "${material.type}" (chọn: ${Object.values(ExamMaterialType).join(', ')}).`,
            );
            return;
          }
          const hasContent = !!material.content?.trim();
          const hasFileUrl = !!material.fileUrl?.trim();
          if (!hasContent && !hasFileUrl) {
            if (material.type === ExamMaterialType.PASSAGE || material.type === ExamMaterialType.TEXT) {
              err(
                'MATERIAL_CONTENT_REQUIRED',
                materialPath,
                `Tài liệu ${material.type} "${material.title ?? `#${mi + 1}`}" thiếu nội dung (cột material_content).`,
              );
            } else {
              err(
                'MATERIAL_SOURCE_REQUIRED',
                materialPath,
                `Tài liệu ${material.type} "${material.title ?? `#${mi + 1}`}" thiếu đường dẫn/nội dung (material_content nên là URL file).`,
              );
            }
          } else if (material.type === ExamMaterialType.AUDIO && !hasFileUrl) {
            warn(
              'AUDIO_NO_URL',
              materialPath,
              `Tài liệu AUDIO "${material.title ?? `#${mi + 1}`}" không phải URL — trình phát có thể không hoạt động.`,
            );
          }
        });

        this.checkQuestions(group.questions, `${groupPath}.questions`, err, warn);
      });
    });

    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    return {
      canSave: errorCount === 0,
      errorCount,
      warningCount,
      issues,
      sections: progress,
    };
  }

  private importedCount(section: {
    directQuestions: NormalizedQuestion[];
    groups: { questions: NormalizedQuestion[] }[];
  }): number {
    return questionTotal(section);
  }

  private checkQuestions(
    questions: NormalizedQuestion[],
    basePath: string,
    err: (code: string, path: string, message: string) => void,
    warn: (code: string, path: string, message: string) => void,
  ): void {
    const seenText = new Map<string, number>();
    const positionCount = new Map<number, number>();

    questions.forEach((question, qi) => {
      const path = `${basePath}.${qi}`;

      if (!question.question.trim()) {
        err('QUESTION_EMPTY', path, 'Câu hỏi không có nội dung (cột "question").');
      }
      if (!QUESTION_TYPES.has(question.type)) {
        err(
          'QUESTION_TYPE_INVALID',
          path,
          `question_type không hợp lệ "${question.type}" (chọn: ${Object.values(QuestionType).join(', ')}).`,
        );
      }

      const options = question.options.filter((o) => (o.content ?? '').trim() !== '');
      const isChoiceLike =
        CHOICE_TYPES.has(question.type) || question.type === QuestionType.TRUE_FALSE;

      if (isChoiceLike) {
        if (options.length < 2) {
          err(
            'OPTION_TOO_FEW',
            path,
            `Câu "${trunc(question.question)}" cần ít nhất 2 đáp án có nội dung.`,
          );
        }
        const correctCount = options.filter((o) => o.isCorrect).length;
        if (correctCount === 0) {
          err(
            'ANSWER_MISSING',
            path,
            `Câu "${trunc(question.question)}" chưa có đáp án đúng (cột correct_answer / chọn đáp án trong preview).`,
          );
        }
        if (question.type === QuestionType.MULTIPLE_CHOICE && correctCount > 1) {
          err(
            'ANSWER_TOO_MANY',
            path,
            `Câu "${trunc(question.question)}" (MULTIPLE_CHOICE) chỉ được 1 đáp án đúng.`,
          );
        }
        if (question.type === QuestionType.MULTI_SELECT && correctCount === 1) {
          warn(
            'ANSWER_SINGLE',
            path,
            `Câu "${trunc(question.question)}" (MULTI_SELECT) nên có từ 2 đáp án đúng.`,
          );
        }
      } else if (
        question.type === QuestionType.FILL_BLANK ||
        question.type === QuestionType.SHORT_ANSWER
      ) {
        if (options.length === 0) {
          err(
            'ANSWER_REQUIRED',
            path,
            `Câu "${trunc(question.question)}" thiếu đáp án (cột correct_answer).`,
          );
        }
      } else if (question.type === QuestionType.ESSAY || question.type === QuestionType.AUDIO_RECORD) {
        if (options.length > 0) {
          warn('OPTIONS_IGNORED', path, 'Câu tự luận/ghi âm không cần đáp án trắc nghiệm.');
        }
      }

      const normalizedText = question.question.trim().toLowerCase().replace(/\s+/g, ' ');
      if (normalizedText) {
        if (seenText.has(normalizedText)) {
          warn(
            'QUESTION_DUP',
            path,
            `Nội dung câu hỏi trùng với mục ${basePath}.${seenText.get(normalizedText)} trong cùng phần.`,
          );
        } else {
          seenText.set(normalizedText, qi);
        }
      }

      positionCount.set(question.position, (positionCount.get(question.position) ?? 0) + 1);
    });

    positionCount.forEach((count, position) => {
      if (count > 1) {
        warn(
          'POSITION_DUP',
          basePath,
          `Có ${count} mục cùng position = ${position} — thứ tự sẽ được sắp xếp lại khi lưu.`,
        );
      }
    });
  }
}
