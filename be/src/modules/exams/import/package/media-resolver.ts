import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import {
  FILE_STORAGE,
  type FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';
import type { ImportRow, NormalizedExamImport } from '../exam-import.model';
import {
  PACKAGE_MEDIA_PREFIX,
  type PackageImportIssue,
  type PackageMediaFile,
  type PackageMediaKind,
  type PackageMediaReport,
  type PackageMediaRef,
  type PackageMediaStatus,
} from './package-import.model';
import type { ExtractedZip, ZipEntryInfo } from './zip-extractor';

const AUDIO_EXT = new Set([
  '.mp3', '.wav', '.ogg', '.oga', '.m4a', '.aac', '.flac', '.opus', '.webm', '.wma',
]);
const IMAGE_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.avif', '.tif', '.tiff',
]);

const AUDIO_MIME: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.oga': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac',
  '.opus': 'audio/ogg',
  '.webm': 'audio/webm',
  '.wma': 'audio/x-ms-wma',
};
const IMAGE_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.avif': 'image/avif',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
};

const MAX_UNUSED_LISTED = 8;

function kindOfExt(ext: string): PackageMediaKind {
  if (AUDIO_EXT.has(ext)) return 'audio';
  if (IMAGE_EXT.has(ext)) return 'image';
  return 'other';
}

function mimeOf(ext: string, kind: PackageMediaKind): string {
  return (kind === 'image' ? IMAGE_MIME[ext] : AUDIO_MIME[ext]) ?? 'application/octet-stream';
}

function normalizeRef(raw: string): string {
  return raw
    .replace(/\\/g, '/')
    .replace(/^(\.\/)+/, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .trim();
}

function basename(path: string): string {
  return path.split('/').pop() ?? path;
}

function trunc(text: string, max = 70): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * Matches every "Media filename" reference against the files inside the ZIP
 * and (on confirm) uploads the matched files to R2.
 *
 * Matching order:
 *   1. exact path (tolerating a single wrapper folder — "toeic-test/Part-1/…")
 *   2. same path, different casing            -> warning (still imported)
 *   3. unique basename under another folder   -> ERROR (wrong folder)
 *   4. several basenames                      -> ERROR (ambiguous)
 *   5. not found                              -> ERROR (missing)
 * Plus format checks: extension must be an allowed audio/image type and must
 * not contradict the row's Material Type column.
 */
@Injectable()
export class MediaResolver {
  constructor(@Inject(FILE_STORAGE) private readonly storage: FileStorage) {}

  resolve(rows: ImportRow[], zip: ExtractedZip): {
    report: PackageMediaReport;
    issues: PackageImportIssue[];
  } {
    const files = zip.files;
    const rootPrefix = this.detectRootPrefix(files);
    const strip = (path: string) =>
      rootPrefix && path.startsWith(`${rootPrefix}/`)
        ? path.slice(rootPrefix.length + 1)
        : path;

    const exact = new Map<string, ZipEntryInfo>();
    const insensitive = new Map<string, ZipEntryInfo>();
    for (const file of files) {
      const stripped = strip(file.path);
      if (!exact.has(stripped)) exact.set(stripped, file);
      const key = stripped.toLowerCase();
      if (!insensitive.has(key)) insensitive.set(key, file);
    }

    // ---------- collect refs (with fill-down section/group for reporting) ----------
    const refs = new Map<string, PackageMediaRef>();
    let currentSection: string | null = null;
    let currentGroup: string | null = null;
    for (const row of rows) {
      const sectionCell = (row.section ?? '').trim();
      if (sectionCell) currentSection = sectionCell;
      const groupCell = (row.group ?? '').trim();
      if (groupCell) {
        currentGroup = /^(?:[-–—]|direct)$/i.test(groupCell) ? null : groupCell;
      }

      const raw = (row.media ?? '').trim();
      if (!raw || /^(https?:|data:)/i.test(raw)) continue; // external URL — nothing to match
      const ref = normalizeRef(raw);
      if (!ref) continue;
      const key = ref.toLowerCase();

      const declaredType = (row.materialType ?? '').trim() || null;
      const existing = refs.get(key);
      if (existing) {
        if (!existing.declaredType && declaredType) existing.declaredType = declaredType;
        continue;
      }
      refs.set(key, {
        ref,
        resolvedPath: null,
        kind: 'other',
        status: 'missing',
        excelRow: row.__excelRow ?? null,
        section: currentSection,
        group: currentGroup,
        question: row.question?.trim() ? trunc(row.question.trim()) : null,
        declaredType,
        message: null,
      });
    }

    // ---------- match + validate ----------
    const issues: PackageImportIssue[] = [];
    const usedPaths = new Set<string>();
    let matched = 0;
    let missing = 0;

    for (const ref of refs.values()) {
      let entry = exact.get(ref.ref) ?? null;
      let status: PackageMediaStatus = 'ok';

      if (!entry) {
        const ci = insensitive.get(ref.ref.toLowerCase());
        if (ci) {
          entry = ci;
          status = 'moved';
          ref.message = `Đường dẫn khác hoa/thường ký tự — dùng "${ci.path}".`;
        }
      }

      if (!entry) {
        const base = basename(ref.ref).toLowerCase();
        const baseMatches = files.filter((f) => basename(f.path).toLowerCase() === base);
        if (baseMatches.length === 1) {
          entry = baseMatches[0];
          status = 'wrong_path';
          ref.message =
            `File nằm ở "${entry.path}" nhưng Excel ghi "${ref.ref}" — ` +
            'sửa cột "Media filename" cho đúng đường dẫn (hoặc chuyển file vào đúng thư mục).';
        } else if (baseMatches.length > 1) {
          status = 'ambiguous';
          ref.message =
            `Có ${baseMatches.length} file cùng tên trong ZIP (${baseMatches
              .slice(0, 3)
              .map((f) => f.path)
              .join(', ')}${baseMatches.length > 3 ? '…' : ''}) — ghi đầy đủ đường dẫn để phân biệt.`;
          missing += 1;
          ref.status = status;
          this.pushIssue(issues, ref, 'MEDIA_AMBIGUOUS', 'error');
          continue;
        } else {
          status = 'missing';
          ref.message = `Không tìm thấy file "${ref.ref}" trong ZIP — kiểm tra tên file và đường dẫn.`;
        }
      }

      if (entry) {
        ref.resolvedPath = entry.path;
        const ext = extname(entry.path).toLowerCase();
        ref.kind = kindOfExt(ext);

        if (ref.kind === 'other') {
          status = 'bad_format';
          ref.message =
            `Định dạng "${ext || '(không có phần mở rộng)'}" của "${entry.path}" không hỗ trợ — ` +
            'chỉ nhận file audio (mp3, wav, m4a, ogg, aac, flac, webm) hoặc ảnh (png, jpg, jpeg, webp, gif, svg, bmp, avif).';
        } else {
          const declared = (ref.declaredType ?? '').trim().toUpperCase();
          if (
            (declared === 'AUDIO' && ref.kind !== 'audio') ||
            (declared === 'IMAGE' && ref.kind !== 'image')
          ) {
            status = 'type_mismatch';
            ref.message =
              `Cột Material Type = ${declared} nhưng "${entry.path}" là file ${ref.kind} — ` +
              'sửa Material Type hoặc chọn đúng file.';
          }
        }
      }

      ref.status = status;
      if (status === 'ok' || status === 'moved') {
        matched += 1;
        if (entry) usedPaths.add(entry.path);
        if (status === 'moved') this.pushIssue(issues, ref, 'MEDIA_PATH_CASE', 'warning');
      } else {
        missing += 1;
        if (status === 'wrong_path') this.pushIssue(issues, ref, 'MEDIA_PATH_WRONG', 'error');
        else if (status === 'bad_format') this.pushIssue(issues, ref, 'MEDIA_FORMAT', 'error');
        else if (status === 'type_mismatch')
          this.pushIssue(issues, ref, 'MEDIA_TYPE_MISMATCH', 'error');
        else this.pushIssue(issues, ref, 'MEDIA_MISSING', 'error');
      }
    }

    // ---------- media inventory ----------
    const mediaFiles: PackageMediaFile[] = files
      .filter((f) => kindOfExt(extname(f.path).toLowerCase()) !== 'other')
      .map((f) => ({
        path: f.path,
        size: f.size,
        kind: kindOfExt(extname(f.path).toLowerCase()),
        used: usedPaths.has(f.path),
      }));
    const unused = mediaFiles.filter((f) => !f.used);
    if (unused.length > 0) {
      const shown = unused
        .slice(0, MAX_UNUSED_LISTED)
        .map((f) => f.path)
        .join(', ');
      issues.push({
        severity: 'warning',
        code: 'MEDIA_UNUSED',
        path: '',
        message:
          `${unused.length} file media trong ZIP không được cột "Media filename" tham chiếu` +
          `${unused.length > MAX_UNUSED_LISTED ? ` (${shown}, …)` : ` (${shown})`}.`,
        excelRow: null,
        section: null,
        question: null,
        field: 'Media filename',
      });
    }

    const report: PackageMediaReport = {
      refs: [...refs.values()],
      files: mediaFiles,
      matched,
      missing,
      audio: mediaFiles.filter((f) => f.kind === 'audio').length,
      image: mediaFiles.filter((f) => f.kind === 'image').length,
    };
    return { report, issues };
  }

  /** Uploads every matched media file to R2 (confirm step only). */
  async upload(
    zip: ExtractedZip,
    report: PackageMediaReport,
    examId: number,
  ): Promise<Map<string, string>> {
    const urls = new Map<string, string>();
    for (const ref of report.refs) {
      if (ref.status !== 'ok' && ref.status !== 'moved') continue;
      if (!ref.resolvedPath) continue;
      const key = ref.ref.toLowerCase();
      if (urls.has(key)) continue;

      const data = zip.readInsensitive(ref.resolvedPath);
      if (!data?.length) {
        throw new BadRequestException(`Không đọc được file media "${ref.resolvedPath}" từ ZIP.`);
      }
      const ext = extname(ref.resolvedPath).toLowerCase();
      const folder = ref.kind === 'image' ? 'exams/images' : 'exams/audio';
      const storageKey = `${folder}/import-${examId}-${randomUUID()}${ext}`;
      await this.storage.upload({
        key: storageKey,
        body: data,
        contentType: mimeOf(ext, ref.kind),
        contentLength: data.length,
      });
      urls.set(key, this.storage.getPublicUrl(storageKey) ?? `/storage/${storageKey}`);
    }
    return urls;
  }

  /**
   * Replaces `package://path` placeholders with the uploaded URLs.
   * Throws when a placeholder has no URL — callers upload first, so this only
   * trips on bugs; it guarantees a broken URL is never persisted.
   */
  replacePlaceholders(data: NormalizedExamImport, urls: Map<string, string>): number {
    let replaced = 0;
    for (const section of data.sections) {
      for (const group of section.groups) {
        for (const material of group.materials) {
          if (!material.fileUrl?.startsWith(PACKAGE_MEDIA_PREFIX)) continue;
          const ref = normalizeRef(material.fileUrl.slice(PACKAGE_MEDIA_PREFIX.length));
          const url = urls.get(ref.toLowerCase());
          if (!url) {
            throw new BadRequestException(
              `Media "${ref}" chưa được tải lên — import bị hủy, không có dữ liệu nào được lưu.`,
            );
          }
          material.fileUrl = url;
          replaced += 1;
        }
      }
    }
    return replaced;
  }

  /**
   * One wrapper folder ("toeic-test/…") only — real packages keep parts at
   * the root (or under distinct folders that cannot be stripped safely).
   */
  private detectRootPrefix(files: ZipEntryInfo[]): string {
    const withSlash = files.filter((f) => f.path.includes('/'));
    if (withSlash.length === 0 || withSlash.length !== files.length) return '';
    const first = new Set(withSlash.map((f) => f.path.split('/')[0]));
    if (first.size !== 1) return '';
    return [...first][0];
  }

  private pushIssue(
    issues: PackageImportIssue[],
    ref: PackageMediaRef,
    code: string,
    severity: 'error' | 'warning',
  ): void {
    issues.push({
      severity,
      code,
      path: '',
      message: ref.message ?? `Media "${ref.ref}" không hợp lệ.`,
      excelRow: ref.excelRow,
      section: ref.section,
      question: ref.question,
      field: 'Media filename',
    });
  }
}
