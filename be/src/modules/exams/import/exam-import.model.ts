/**
 * Shared, transport-safe model of the Exam Import pipeline:
 *
 *   Import -> Parser -> Normalizer -> Validator -> Preview -> Save
 *
 * Nothing in this model references database ids: Admin previews/edits the
 * normalized structure and the save step maps it onto an existing exam.
 */
import type { ExamGroupType } from '../domain/enums/exam-group-type.enum';
import type { ExamMaterialType } from '../domain/enums/exam-material-type.enum';
import type { QuestionType } from '../domain/enums/question-type.enum';

/** Raw row produced by a file parser (Excel/CSV row or parsed text lines). */
export interface ImportRow {
  section?: string;
  group?: string;
  groupType?: string;
  materialType?: string;
  materialTitle?: string;
  materialContent?: string;
  question?: string;
  questionType?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  position?: string;
  points?: string;
  /** Media file reference inside the ZIP package (e.g. "Part-2/audio/g1.mp3"). */
  media?: string;
  /** "Question Number" — purely informational (Câu 42), never drives ordering. */
  questionNumber?: string;
  /**
   * 1-based Excel row this record came from — attached by the Excel parser so
   * validation errors can point Admin at the exact row. Meta key: ignored by
   * the normalizer's "has content" checks.
   */
  __excelRow?: number;
}

export interface ParsedExamFile {
  rows: ImportRow[];
  warnings: string[];
}

/** Metadata resolved from the target exam, used by exam-type mapping rules. */
export interface ExamImportContext {
  examTypeName: string | null;
  examFormatName: string | null;
}

export interface NormalizedOption {
  content: string;
  isCorrect: boolean;
  position: number;
}

export interface NormalizedQuestion {
  type: QuestionType;
  question: string;
  explanation: string | null;
  points: number;
  position: number;
  options: NormalizedOption[];
  /** Excel row this question came from (package/Excel import error reporting). */
  sourceRow?: number | null;
  /** "Question Number" from the file — display only. */
  questionNumber?: string | null;
}

export interface NormalizedMaterial {
  type: ExamMaterialType;
  title: string | null;
  content: string | null;
  fileUrl: string | null;
  transcript: string | null;
  position: number;
  sourceRow?: number | null;
}

export interface NormalizedGroup {
  name: string;
  groupType: ExamGroupType;
  materials: NormalizedMaterial[];
  questions: NormalizedQuestion[];
  position: number;
  sourceRow?: number | null;
}

export interface NormalizedSection {
  name: string;
  directQuestions: NormalizedQuestion[];
  groups: NormalizedGroup[];
  sourceRow?: number | null;
}

export interface NormalizedExamImport {
  sections: NormalizedSection[];
}

export type ImportIssueSeverity = 'error' | 'warning';

export interface ImportIssue {
  severity: ImportIssueSeverity;
  code: string;
  path: string;
  message: string;
  /** Excel row the problem was found on (when the source row is known). */
  excelRow?: number | null;
}

export interface ImportSectionProgress {
  sectionId: number | null;
  name: string;
  actual: number;
  target: number | null;
  ok: boolean;
}

export interface ImportValidationReport {
  canSave: boolean;
  errorCount: number;
  warningCount: number;
  issues: ImportIssue[];
  sections: ImportSectionProgress[];
}

export interface ExamImportPreview {
  fileName: string;
  format: string;
  normalized: NormalizedExamImport;
  report: ImportValidationReport;
}

export interface ExamImportSaveSummary {
  sections: number;
  groups: number;
  materials: number;
  questions: number;
  options: number;
}
