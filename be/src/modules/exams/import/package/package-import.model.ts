/**
 * Transport-safe model of the Admin Exam Package (ZIP) import:
 *
 *   Template (ZIP) -> Upload -> Extract -> Excel parse -> Media resolve
 *                  -> Normalize -> Validate -> Preview -> Confirm (upload + save)
 *
 * Preview is read-only (no DB / R2 writes); Confirm re-runs the whole pipeline
 * on the uploaded ZIP (stateless) and only writes when the report has 0 errors.
 */
import type {
  ImportIssue,
  ImportRow,
  ImportValidationReport,
  NormalizedExamImport,
} from '../exam-import.model';

/** Placeholder scheme for a media file that lives inside the uploaded ZIP. */
export const PACKAGE_MEDIA_PREFIX = 'package://';

/** Issue enriched with the Excel row / section / question / field it belongs to. */
export interface PackageImportIssue extends ImportIssue {
  excelRow?: number | null;
  section?: string | null;
  question?: string | null;
  field?: string | null;
}

export type PackageValidationReport = Omit<ImportValidationReport, 'issues'> & {
  issues: PackageImportIssue[];
};

export type PackageMediaKind = 'audio' | 'image' | 'other';

/**
 * ok          — exact path inside the ZIP
 * moved       — same file, different folder/casing (warning; still imported)
 * wrong_path  — file exists under another folder (error — fix the Media column)
 * ambiguous   — several files share the name (error — give the full path)
 * missing     — no such file in the ZIP (error)
 * bad_format  — extension is not an allowed audio/image format (error)
 * type_mismatch — Media column contradicts the file type (error)
 */
export type PackageMediaStatus =
  | 'ok'
  | 'moved'
  | 'wrong_path'
  | 'ambiguous'
  | 'missing'
  | 'bad_format'
  | 'type_mismatch';

export interface PackageMediaRef {
  /** Media value as written in the Excel (normalized separators). */
  ref: string;
  /** Path matched inside the ZIP (null when it cannot be matched). */
  resolvedPath: string | null;
  kind: PackageMediaKind;
  status: PackageMediaStatus;
  excelRow: number | null;
  section: string | null;
  group: string | null;
  question: string | null;
  /** material_type column value on the referencing row (AUDIO / IMAGE / ...). */
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

/** Parse/normalize/media issues — report issues before base validation. */
export interface PackagePipelineIssues {
  report: PackageMediaReport;
  issues: PackageImportIssue[];
}

export interface PackageImportSummary {
  sections: number;
  groups: number;
  materials: number;
  questions: number;
  options: number;
}

/**
 * Cell overwrites for ONE Excel row — `fields` keys are ImportRow keys
 * (`section`, `question`, `optionA`, ... — the header-mapped cell names).
 */
export interface PackageImportRowEdit {
  excelRow: number;
  fields: Record<string, string>;
}

/**
 * In-place patch the Admin builds while reviewing the preview: drop broken
 * rows or fix cells without re-editing the ZIP externally. Applied right
 * after `packageParser.parse()` and before media / normalize / validate,
 * so the whole report (preview + confirm) reflects it.
 */
export interface PackageImportPatch {
  /** Excel rows to drop entirely (rows that cannot be salvaged). */
  removedRows?: number[];
  /** Cell edits keyed by the 1-based Excel row they came from. */
  edits?: PackageImportRowEdit[];
}

export interface PackageImportPreview {
  fileName: string;
  normalized: NormalizedExamImport;
  report: PackageValidationReport;
  media: PackageMediaReport;
  summary: PackageImportSummary;
  /** Raw rows as parsed from the ZIP (BEFORE the patch) — the UI applies its
   *  own patch on top for display, so edits/removals can be undone. */
  rows: ImportRow[];
}

export interface PackageImportResult extends PackageImportSummary {
  mediaUploaded: number;
}

export interface PackageTemplateSection {
  name: string;
  questionCount: number;
}
