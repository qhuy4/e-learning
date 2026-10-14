import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ExamSection } from '../../domain/entity/exam-section.entity';
import type { Exam } from '../../domain/entity/exam.entity';
import { EXAM_FORMAT_SECTION_REPOSITORY } from '../../domain/repository/exam-format-section.repository';
import type { IExamFormatSectionRepository } from '../../domain/repository/exam-format-section.repository';
import { EXAM_SECTION_REPOSITORY } from '../../domain/repository/exam-section.repository';
import type { IExamSectionRepository } from '../../domain/repository/exam-section.repository';
import type {
  ExamImportContext,
  ImportRow,
  NormalizedExamImport,
} from '../exam-import.model';
import { ExamImportNormalizer } from '../normalizer/exam-import.normalizer';
import { ExamImportService } from '../exam-import.service';
import { MediaResolver } from './media-resolver';
import {
  type PackageImportIssue,
  type PackageImportPatch,
  type PackageImportPreview,
  type PackageImportResult,
  type PackageImportSummary,
  type PackageMediaReport,
  type PackageTemplateSection,
  type PackageValidationReport,
} from './package-import.model';
import { PackageExcelParser } from './package-excel.parser';
import { PackageTemplateGenerator } from './template-generator';
import { PackageValidator } from './package-validator';
import { ZipExtractor, type ExtractedZip } from './zip-extractor';

interface UploadedFileLike {
  originalname: string;
  mimetype?: string;
  buffer: Buffer;
}

interface PreparedPackage {
  exam: Exam;
  /** Sections the report was validated against (persisted or virtual). */
  sections: ExamSection[];
  sectionsPersisted: boolean;
  ctx: ExamImportContext;
  zip: ExtractedZip;
  rows: ImportRow[];
  /** Rows as parsed from the ZIP, before `patch` — echoed to the UI. */
  rawRows: ImportRow[];
  normalized: NormalizedExamImport;
  media: PackageMediaReport;
  report: PackageValidationReport;
  summary: PackageImportSummary;
}

/**
 * ImportRow keys the Admin may overwrite from the preview UI (whitelist —
 * `__excelRow` and anything unknown is ignored).
 */
const PATCHABLE_ROW_KEYS = new Set<string>([
  'section',
  'group',
  'groupType',
  'materialType',
  'materialTitle',
  'materialContent',
  'question',
  'questionType',
  'optionA',
  'optionB',
  'optionC',
  'optionD',
  'correctAnswer',
  'explanation',
  'position',
  'points',
  'media',
  'questionNumber',
]);

/**
 * Drop removed rows and overwrite whitelisted cells, right after parse and
 * before media-resolve / normalize / validate — so preview, report and the
 * eventual confirm all see the patched data. Pure: never mutates `rows`.
 */
export function applyPackagePatch(
  rows: ImportRow[],
  patch?: PackageImportPatch | null,
): ImportRow[] {
  const removed = patch?.removedRows ?? [];
  const edits = patch?.edits ?? [];
  if (removed.length === 0 && edits.length === 0) return rows;

  const removedSet = new Set<number>();
  for (const raw of removed) {
    const n = Number(raw);
    if (Number.isInteger(n) && n > 0) removedSet.add(n);
  }
  const editsByRow = new Map<number, Record<string, string>>();
  for (const edit of edits) {
    const row = Number(edit?.excelRow);
    if (!Number.isInteger(row) || row <= 0) continue;
    editsByRow.set(row, edit.fields ?? {});
  }
  if (removedSet.size === 0 && editsByRow.size === 0) return rows;

  const out: ImportRow[] = [];
  for (const row of rows) {
    const at = row.__excelRow;
    if (at != null && removedSet.has(at)) continue;
    const fields = at != null ? editsByRow.get(at) : undefined;
    if (!fields) {
      out.push(row);
      continue;
    }
    const next: ImportRow = { ...row };
    for (const [key, value] of Object.entries(fields)) {
      if (!PATCHABLE_ROW_KEYS.has(key)) continue;
      const cellKey = key as Exclude<keyof ImportRow, '__excelRow'>;
      next[cellKey] = value == null ? '' : String(value);
    }
    out.push(next);
  }
  return out;
}

/**
 * Admin Exam Package (ZIP) import — orchestrates the six moving parts:
 *
 *   TemplateGenerator → ZIP template from the exam's format (DB-driven)
 *   ZipExtractor      → safe extraction (zip-slip / size guards)
 *   PackageExcelParser→ questions.xlsx → ImportRow[] (+ Excel row numbers)
 *   MediaResolver     → match "Media filename" refs against ZIP files
 *   PackageValidator  → base validation + package rules, enriched issues
 *   ExamPackageImporter (this) → preview / confirm orchestration
 *
 * Preview is read-only. Confirm re-runs the pipeline on the uploaded ZIP
 * (stateless — no preview tokens) and refuses to write anything while the
 * report has errors: sections → media upload → content save, in that order.
 */
@Injectable()
export class ExamPackageImporter {
  constructor(
    @Inject(EXAM_SECTION_REPOSITORY)
    private readonly sectionRepo: IExamSectionRepository,
    @Inject(EXAM_FORMAT_SECTION_REPOSITORY)
    private readonly formatSectionRepo: IExamFormatSectionRepository,
    private readonly zipExtractor: ZipExtractor,
    private readonly templateGenerator: PackageTemplateGenerator,
    private readonly packageParser: PackageExcelParser,
    private readonly mediaResolver: MediaResolver,
    private readonly packageValidator: PackageValidator,
    private readonly normalizer: ExamImportNormalizer,
    private readonly importService: ExamImportService,
  ) {}

  /** `GET /admin/exams/:examId/import-template` — ZIP built from the format. */
  async buildTemplate(examId: number): Promise<{ buffer: Buffer; fileName: string }> {
    const { exam, sections, ctx } = await this.importService.loadContext(examId);
    const templateSections =
      sections.length > 0
        ? [...sections]
            .sort((a, b) => a.position - b.position)
            .map((s) => ({ name: s.name, questionCount: s.questionCount ?? 0 }))
        : await this.formatSections(exam.examFormatId);
    if (templateSections.length === 0) {
      throw new BadRequestException(
        'Đề thi chưa có cấu trúc phần thi (format chưa khai báo Section) — không thể tạo template ZIP.',
      );
    }
    return this.templateGenerator.build({ title: exam.title, sections: templateSections, ctx });
  }

  /** `POST /admin/exams/:examId/import/preview` — read-only, nothing saved. */
  async preview(
    examId: number,
    file: UploadedFileLike,
    patch?: PackageImportPatch | null,
  ): Promise<PackageImportPreview> {
    const prepared = await this.prepare(examId, file, patch);
    return {
      fileName: file.originalname,
      normalized: prepared.normalized,
      report: prepared.report,
      media: prepared.media,
      summary: prepared.summary,
      rows: prepared.rawRows,
    };
  }

  /** `POST /admin/exams/:examId/import/confirm` — writes only when 0 errors. */
  async confirm(
    examId: number,
    file: UploadedFileLike,
    patch?: PackageImportPatch | null,
  ): Promise<PackageImportResult> {
    const p = await this.prepare(examId, file, patch);

    if (!p.report.canSave) {
      throw new BadRequestException({
        message: `Gói ZIP còn ${p.report.errorCount} lỗi — không import, không có dữ liệu nào bị thay đổi.`,
        error: 'Bad Request',
        issues: p.report.issues.filter((i) => i.severity === 'error'),
        report: p.report,
      });
    }

    // 1) Sections first — the content save maps onto existing sections.
    if (!p.sectionsPersisted) {
      await this.sectionRepo.saveAll(p.sections);
      p.sectionsPersisted = true;
    }

    // 2) Media to R2, then resolve package:// placeholders to real URLs.
    const urls = await this.mediaResolver.upload(p.zip, p.media, examId);
    this.mediaResolver.replacePlaceholders(p.normalized, urls);

    // 3) Content — same save path as the Excel flow (re-validates, then writes).
    const summary = await this.importService.save(examId, p.normalized);
    return { ...summary, mediaUploaded: urls.size };
  }

  /** Shared pipeline: extract → parse → patch → media → normalize → validate. */
  private async prepare(
    examId: number,
    file: UploadedFileLike,
    patch?: PackageImportPatch | null,
  ): Promise<PreparedPackage> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Thiếu file ZIP tải lên (field "file").');
    }

    const { exam, sections, ctx } = await this.importService.loadContext(examId);

    let targetSections = sections;
    let sectionsPersisted = true;
    if (targetSections.length === 0) {
      const formatSections = await this.formatSectionRepo.findByExamFormatId(exam.examFormatId);
      if (formatSections.length === 0) {
        throw new BadRequestException(
          'Đề thi chưa có cấu trúc phần thi (format chưa khai báo Section) — không thể import.',
        );
      }
      targetSections = [...formatSections]
        .sort((a, b) => a.position - b.position)
        .map((fs) =>
          ExamSection.create({
            examId: exam.id!,
            formatSectionId: fs.id ?? 0,
            name: fs.name,
            position: fs.position,
            questionCount: fs.questionCount ?? 0,
            sectionType: fs.sectionType,
          }),
        );
      sectionsPersisted = false;
    }

    const zip = this.zipExtractor.extract(file.buffer, file.originalname);
    const parsed = await this.packageParser.parse(zip);
    const rawRows = parsed.rows;
    const rows = applyPackagePatch(rawRows, patch);
    const { report: mediaReport, issues: mediaIssues } = this.mediaResolver.resolve(rows, zip);
    const normalized = this.normalizer.normalize(rows, ctx);

    const toIssue = (message: string): PackageImportIssue => ({
      severity: 'warning',
      code: 'PARSE',
      path: '',
      message,
    });
    const preIssues: PackageImportIssue[] = [
      ...zip.warnings.map(toIssue),
      ...parsed.warnings.map(toIssue),
      ...normalized.warnings.map((w) => ({ ...w })),
      ...mediaIssues,
    ];

    const report = this.packageValidator.validate({
      data: normalized.data,
      examSections: targetSections,
      ctx,
      preIssues,
      rows,
    });

    return {
      exam,
      sections: targetSections,
      sectionsPersisted,
      ctx,
      zip,
      rows,
      rawRows,
      normalized: normalized.data,
      media: mediaReport,
      report,
      summary: summarize(normalized.data),
    };
  }

  private async formatSections(formatId: number): Promise<PackageTemplateSection[]> {
    const sections = await this.formatSectionRepo.findByExamFormatId(formatId);
    return [...sections]
      .sort((a, b) => a.position - b.position)
      .map((s) => ({ name: s.name, questionCount: s.questionCount ?? 0 }));
  }
}

export function summarize(data: NormalizedExamImport): PackageImportSummary {
  const summary: PackageImportSummary = {
    sections: data.sections.length,
    groups: 0,
    materials: 0,
    questions: 0,
    options: 0,
  };
  for (const section of data.sections) {
    summary.questions += section.directQuestions.length;
    summary.options += section.directQuestions.reduce(
      (n, q) => n + q.options.filter((o) => (o.content ?? '').trim() !== '').length,
      0,
    );
    summary.groups += section.groups.length;
    for (const group of section.groups) {
      summary.materials += group.materials.length;
      summary.questions += group.questions.length;
      summary.options += group.questions.reduce(
        (n, q) => n + q.options.filter((o) => (o.content ?? '').trim() !== '').length,
        0,
      );
    }
  }
  return summary;
}
