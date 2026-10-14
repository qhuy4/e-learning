import type { ExamGroupType, ExamMaterialType, QuestionType } from "./exam";

/** Normalized import structure — no database ids; Admin edits before saving. */
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
  /** Excel row this question came from (error reporting). */
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

export type ImportIssueSeverity = "error" | "warning";

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
