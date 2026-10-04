import { Injectable } from '@nestjs/common';
import type { ExamSection } from '../../domain/entity/exam-section.entity';
import type {
  ExamImportContext,
  ImportRow,
  NormalizedExamImport,
} from '../exam-import.model';
import { ExamImportValidator } from '../validator/exam-import.validator';
import {
  type PackageImportIssue,
  type PackageValidationReport,
} from './package-import.model';

/** Excel column header shown per issue code (FE "Trường" column). */
const FIELD_BY_CODE: Record<string, string> = {
  IMPORT_EMPTY: 'File',
  PARSE: 'File',
  PACKAGE_REF_UNRESOLVED: 'Media filename',
  NO_SECTION_MATCH: 'Section/Part',
  SECTION_UNKNOWN: 'Section/Part',
  SECTION_EMPTY: 'Section/Part',
  SECTION_MISSING_ROWS: 'Section/Part',
  SECTION_COUNT: 'Section/Part',
  DIRECT_IN_GROUPED_SECTION: 'Group',
  GROUPED_IN_DIRECT_SECTION: 'Group',
  MATERIAL_IMPLICIT_GROUP: 'Group',
  GROUP_TYPE_INVALID: 'Group Type',
  GROUP_TYPE_CONFLICT: 'Group Type',
  GROUP_TYPE_DEFAULT: 'Group Type',
  GROUP_NAME_EMPTY: 'Group',
  GROUP_EMPTY: 'Group',
  MATERIAL_MISSING: 'Material Type',
  MATERIAL_TYPE_INVALID: 'Material Type',
  MATERIAL_TYPE_DEFAULT: 'Material Type',
  MATERIAL_CONTENT_REQUIRED: 'Material Content',
  MATERIAL_SOURCE_REQUIRED: 'Media filename',
  AUDIO_NO_URL: 'Media filename',
  MEDIA_ON_DIRECT: 'Media filename',
  MEDIA_MISSING: 'Media filename',
  MEDIA_PATH_WRONG: 'Media filename',
  MEDIA_PATH_CASE: 'Media filename',
  MEDIA_AMBIGUOUS: 'Media filename',
  MEDIA_FORMAT: 'Media filename',
  MEDIA_TYPE_MISMATCH: 'Media filename',
  MEDIA_UNUSED: 'Media filename',
  QUESTION_EMPTY: 'Question',
  QUESTION_TYPE_INVALID: 'Question Type',
  QUESTION_DUP: 'Question',
  DUP_QUESTION_TEXT: 'Question',
  DUP_QUESTION_NUMBER: 'Question Number',
  OPTION_TOO_FEW: 'Options',
  OPTION_MISSING: 'Options',
  ANSWER_MISSING: 'Correct Answer',
  ANSWER_TOO_MANY: 'Correct Answer',
  ANSWER_REQUIRED: 'Correct Answer',
  ANSWER_SINGLE: 'Correct Answer',
  ANSWER_RANGE: 'Correct Answer',
  OPTIONS_IGNORED: 'Options',
  ESSAY_ANSWER_IGNORED: 'Options',
  POSITION_DUP: 'Question Number',
  ROW_IGNORED: 'Question',
};

interface Located {
  section: string | null;
  question: string | null;
  excelRow: number | null;
}

function sectionKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function trunc(text: string, max = 70): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * Package-mode validation = the base import validator + the ZIP-specific rules
 * from the spec:
 *   - every issue is enriched with Excel row / Section / Question / Field;
 *   - duplicates are errors (row-level, section-wide text + Question Number);
 *   - stray rows and media on group-less questions are errors;
 *   - media issues (missing/wrong path/bad format) come from MediaResolver.
 * The report is read-only — nothing is written while validating.
 */
@Injectable()
export class PackageValidator {
  constructor(private readonly base: ExamImportValidator) {}

  validate(params: {
    data: NormalizedExamImport;
    examSections: ExamSection[];
    ctx: ExamImportContext;
    /** Parse + normalize + media issues. */
    preIssues: PackageImportIssue[];
    /** Raw Excel rows (row-level duplicate checks + display). */
    rows: ImportRow[];
  }): PackageValidationReport {
    const { data, examSections, ctx, preIssues, rows } = params;

    const baseReport = this.base.validate(data, examSections, ctx, preIssues);

    const issues: PackageImportIssue[] = [];
    for (const issue of baseReport.issues) {
      // Stray rows silently dropped = data loss → package import refuses it.
      if (issue.code === 'ROW_IGNORED' && issue.severity === 'warning') {
        issues.push(
          this.enrich({ ...issue, severity: 'error' as const }, data),
        );
        continue;
      }
      // Media on a question without a group cannot be stored → error.
      if (issue.code === 'MEDIA_ON_DIRECT' && issue.severity === 'warning') {
        issues.push(
          this.enrich({ ...issue, severity: 'error' as const }, data),
        );
        continue;
      }
      // Replaced by the section-wide row-level check below (has Excel rows).
      if (issue.code === 'QUESTION_DUP') continue;
      issues.push(this.enrich({ ...issue }, data));
    }

    issues.push(...this.rowLevelIssues(rows, data));

    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    return {
      canSave: errorCount === 0,
      errorCount,
      warningCount,
      issues,
      sections: baseReport.sections,
    };
  }

  /** Duplicate question text / Question Number within the same section. */
  private rowLevelIssues(rows: ImportRow[], data: NormalizedExamImport): PackageImportIssue[] {
    const issues: PackageImportIssue[] = [];
    const seenText = new Map<string, number>();
    const seenNumber = new Map<string, number>();

    for (const row of rows) {
      const excelRow = row.__excelRow ?? null;
      const sectionName = (row.section ?? '').trim() || null;
      const section = sectionKey(sectionName ?? '');
      const question = (row.question ?? '').trim();
      if (!question) continue;

      const textKey = `${section}|${question.toLowerCase().replace(/\s+/g, ' ')}`;
      const firstTextRow = seenText.get(textKey);
      if (firstTextRow !== undefined) {
        issues.push({
          severity: 'error',
          code: 'DUP_QUESTION_TEXT',
          path: '',
          message: `Câu hỏi trùng nội dung với dòng ${firstTextRow} trong cùng phần thi — mỗi câu phải khác nhau (sửa hoặc xóa dòng thừa).`,
          excelRow,
          section: sectionName,
          question: trunc(question),
          field: 'Question',
        });
      } else {
        seenText.set(textKey, excelRow ?? -1);
      }

      const number = (row.questionNumber ?? '').trim();
      if (number) {
        const numberKey = `${section}|${number.toLowerCase()}`;
        const firstNumberRow = seenNumber.get(numberKey);
        if (firstNumberRow !== undefined) {
          issues.push({
            severity: 'error',
            code: 'DUP_QUESTION_NUMBER',
            path: '',
            message: `Question Number "${number}" bị dùng trùng trong cùng phần (dòng ${firstNumberRow}) — số câu phải duy nhất từng phần.`,
            excelRow,
            section: sectionName,
            question: trunc(question),
            field: 'Question Number',
          });
        } else {
          seenNumber.set(numberKey, excelRow ?? -1);
        }
      }
    }
    return issues;
  }

  /** Attach Excel row / Section / Question / Field to a base-validator issue. */
  private enrich(issue: PackageImportIssue, data: NormalizedExamImport): PackageImportIssue {
    const out: PackageImportIssue = { ...issue };

    // The message may name the section directly (SECTION_COUNT indexes exam
    // sections, not imported ones) — prefer the name when present and valid.
    const named = /Phần "([^"]+)"/.exec(issue.message)?.[1];
    let source = this.locate(issue.path, data);
    if (named) {
      const section = data.sections.find((s) => sectionKey(s.name) === sectionKey(named));
      if (section && (!source || sectionKey(source.section ?? '') !== sectionKey(section.name))) {
        source = {
          section: section.name,
          question: null,
          excelRow: section.sourceRow ?? null,
        };
      }
    }

    if (!source) {
      // Group-level warnings from the normalizer carry no path — match by name
      // only when it is unambiguous across the package.
      const groupName = /Group "([^"]+)"/.exec(issue.message)?.[1];
      if (groupName) {
        const matches: { section: string; row: number | null }[] = [];
        for (const section of data.sections) {
          for (const group of section.groups) {
            if (sectionKey(group.name) === sectionKey(groupName)) {
              matches.push({ section: section.name, row: group.sourceRow ?? null });
            }
          }
        }
        if (matches.length === 1) {
          source = { section: matches[0].section, question: null, excelRow: matches[0].row };
        }
      }
    }

    if (source) {
      out.section = out.section ?? source.section;
      out.question = out.question ?? source.question;
      out.excelRow = out.excelRow ?? source.excelRow;
    }
    out.field = out.field ?? FIELD_BY_CODE[issue.code] ?? null;
    return out;
  }

  /** Resolve `sections.N(.groups.G(.questions|materials.I))` against data. */
  private locate(path: string, data: NormalizedExamImport): Located | null {
    if (!path) return null;
    const parts = path.split('.');
    if (parts[0] !== 'sections') return null;
    const section = data.sections[Number(parts[1])];
    if (!section) return null;
    const sectionLocated: Located = {
      section: section.name,
      question: null,
      excelRow: section.sourceRow ?? null,
    };
    if (parts.length === 2) return sectionLocated;
    if (parts[2] === 'directQuestions') {
      const question = section.directQuestions[Number(parts[3])];
      return question
        ? {
            section: section.name,
            question: question.question,
            excelRow: question.sourceRow ?? null,
          }
        : sectionLocated;
    }
    if (parts[2] !== 'groups') return sectionLocated;

    const group = section.groups[Number(parts[3])];
    if (!group) return sectionLocated;
    const groupLocated: Located = {
      section: section.name,
      question: null,
      excelRow: group.sourceRow ?? null,
    };
    if (parts.length === 4) return groupLocated;
    const index = Number(parts[5]);
    if (parts[4] === 'questions' && Number.isFinite(index)) {
      const question = group.questions[index];
      return question
        ? {
            section: section.name,
            question: question.question,
            excelRow: question.sourceRow ?? group.sourceRow ?? null,
          }
        : groupLocated;
    }
    if (parts[4] === 'materials' && Number.isFinite(index)) {
      const material = group.materials[index];
      return material
        ? {
            section: section.name,
            question: material.title,
            excelRow: material.sourceRow ?? group.sourceRow ?? null,
          }
        : groupLocated;
    }
    return groupLocated;
  }
}
