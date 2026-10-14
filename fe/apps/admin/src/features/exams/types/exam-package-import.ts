import type { ImportIssue, ImportSectionProgress, NormalizedExamImport } from "./exam-import";

/**
 * Admin Exam Package (ZIP) import — mirrors the BE model
 * (`be/src/modules/exams/import/package/package-import.model.ts`).
 */

export type PackageMediaKind = "audio" | "image" | "other";

/**
 * ok          — exact path inside the ZIP
 * moved       — same file, different folder/casing (warning; still imported)
 * wrong_path  — file exists under another folder (error)
 * ambiguous   — several files share the name (error)
 * missing     — no such file in the ZIP (error)
 * bad_format  — extension is not an allowed audio/image format (error)
 * type_mismatch — Media column contradicts the file type (error)
 */
export type PackageMediaStatus =
  | "ok"
  | "moved"
  | "wrong_path"
  | "ambiguous"
  | "missing"
  | "bad_format"
  | "type_mismatch";

/** Issue + the Excel row / section / question / field it belongs to. */
export interface PackageImportIssue extends ImportIssue {
  excelRow?: number | null;
  section?: string | null;
  question?: string | null;
  field?: string | null;
}

export interface PackageValidationReport {
  canSave: boolean;
  errorCount: number;
  warningCount: number;
  issues: PackageImportIssue[];
  sections: ImportSectionProgress[];
}

export interface PackageMediaRef {
  ref: string;
  resolvedPath: string | null;
  kind: PackageMediaKind;
  status: PackageMediaStatus;
  excelRow: number | null;
  section: string | null;
  group: string | null;
  question: string | null;
  declaredType: string | null;
  message: string | null;
}

export interface PackageMediaFile {
  path: string;
  size: number;
  kind: PackageMediaKind;
  used: boolean;
}

export interface PackageMediaReport {
  refs: PackageMediaRef[];
  files: PackageMediaFile[];
  matched: number;
  missing: number;
  audio: number;
  image: number;
}

export interface PackageImportSummary {
  sections: number;
  groups: number;
  materials: number;
  questions: number;
  options: number;
}

/** Cell overwrites for ONE Excel row (keys are ImportRow/cell names). */
export interface PackageImportRowEdit {
  excelRow: number;
  fields: Record<string, string>;
}

/**
 * In-place patch built while reviewing the preview: drop broken rows or fix
 * cells without re-editing the ZIP. Sent as a multipart "patch" field.
 */
export interface PackageImportPatch {
  removedRows?: number[];
  edits?: PackageImportRowEdit[];
}

/** Raw Excel row as parsed from the ZIP (before any patch). */
export interface PackageImportRow {
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
  media?: string;
  questionNumber?: string;
  /** 1-based Excel row this record came from. */
  __excelRow?: number;
}

/** Cell keys the row editor may write (mirror of the BE whitelist). */
export const PATCHABLE_ROW_KEYS = [
  "section",
  "group",
  "groupType",
  "materialType",
  "materialTitle",
  "materialContent",
  "question",
  "questionType",
  "optionA",
  "optionB",
  "optionC",
  "optionD",
  "correctAnswer",
  "explanation",
  "position",
  "points",
  "media",
  "questionNumber",
] as const;

export interface PackageImportPreview {
  fileName: string;
  normalized: NormalizedExamImport;
  report: PackageValidationReport;
  media: PackageMediaReport;
  summary: PackageImportSummary;
  /** Raw rows as parsed from the ZIP (before the patch). */
  rows: PackageImportRow[];
}

export interface PackageImportResult extends PackageImportSummary {
  mediaUploaded: number;
}
