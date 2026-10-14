import { BadRequestException, Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';

/** Entry-path junk produced by macOS/Windows compressors — never imported. */
const JUNK_PATTERNS = [/^__MACOSX\//i, /(^|\/)\._/, /(^|\/)\.DS_Store$/i, /(^|\/)Thumbs\.db$/i];

const MAX_ENTRIES = 5000;
const MAX_ENTRY_SIZE = 300 * 1024 * 1024; // 300MB per file
const MAX_TOTAL_SIZE = 600 * 1024 * 1024; // 600MB uncompressed (zip-bomb guard)

export interface ZipEntryInfo {
  /** Normalized relative path: forward slashes, no "./" or leading "/". */
  path: string;
  size: number;
}

export interface ExtractedZip {
  entries: ZipEntryInfo[];
  /** Files only (directories skipped), in archive order. */
  files: ZipEntryInfo[];
  warnings: string[];
  /** Lazily decompress an entry by exact path (null when unknown). */
  read(path: string): Buffer | null;
  /** Lazily decompress by exact or case-insensitive path. */
  readInsensitive(path: string): Buffer | null;
}

function normalizePath(raw: string): string {
  return raw
    .replace(/\\/g, '/')
    .replace(/^(\.\/)+/, '')
    .replace(/^\/+/, '');
}

function isJunk(path: string): boolean {
  return JUNK_PATTERNS.some((re) => re.test(path));
}

/**
 * Reads the uploaded ZIP into memory (central directory only — entry data is
 * decompressed lazily). Guards: zip-slip paths, entry count, per-file and
 * total uncompressed size (zip bombs).
 */
@Injectable()
export class ZipExtractor {
  extract(buffer: Buffer, fileName?: string): ExtractedZip {
    let zip: AdmZip;
    try {
      zip = new AdmZip(buffer);
    } catch {
      throw new BadRequestException(
        `File${fileName ? ` "${fileName}"` : ''} không phải là ZIP hợp lệ — hãy tải đúng gói ZIP (questions.xlsx + thư mục media).`,
      );
    }

    let rawEntries: AdmZip.IZipEntry[];
    try {
      rawEntries = zip.getEntries();
    } catch {
      throw new BadRequestException(
        `Không đọc được nội dung file ZIP${fileName ? ` "${fileName}"` : ''} — file có thể hỏng.`,
      );
    }

    if (rawEntries.length === 0) {
      throw new BadRequestException('ZIP trống — không có file nào bên trong.');
    }
    if (rawEntries.length > MAX_ENTRIES) {
      throw new BadRequestException(
        `ZIP có quá nhiều mục (${rawEntries.length} > ${MAX_ENTRIES}) — hãy đóng gói lại chỉ gồm questions.xlsx và các file media cần import.`,
      );
    }

    const warnings: string[] = [];
    const byPath = new Map<string, AdmZip.IZipEntry>();
    const entries: ZipEntryInfo[] = [];
    const files: ZipEntryInfo[] = [];
    let totalSize = 0;
    let skippedJunk = 0;

    for (const entry of rawEntries) {
      const path = normalizePath(entry.entryName);
      if (!path) continue;
      if (path.split('/').some((seg) => seg === '..')) {
        throw new BadRequestException(
          `ZIP chứa đường dẫn không an toàn ("${path}") — từ chối import vì lý do bảo mật.`,
        );
      }
      if (entry.isDirectory) continue;
      if (isJunk(path)) {
        skippedJunk += 1;
        continue;
      }

      const size = entry.header?.size ?? 0;
      if (size > MAX_ENTRY_SIZE) {
        throw new BadRequestException(
          `File "${path}" quá lớn (${Math.round(size / 1024 / 1024)}MB, tối đa ${Math.round(MAX_ENTRY_SIZE / 1024 / 1024)}MB).`,
        );
      }
      totalSize += size;
      if (totalSize > MAX_TOTAL_SIZE) {
        throw new BadRequestException(
          `ZIP giải nén quá lớn (tối đa ${Math.round(MAX_TOTAL_SIZE / 1024 / 1024)}MB) — hãy chia nhỏ gói media.`,
        );
      }

      // First occurrence wins for the exact key; a case-insensitive index is
      // kept as a fallback (Windows-authored archives).
      if (!byPath.has(path)) byPath.set(path, entry);
      entries.push({ path, size });
      files.push({ path, size });
    }

    if (files.length === 0) {
      throw new BadRequestException('ZIP không chứa file nào (chỉ toàn thư mục trống).');
    }
    if (skippedJunk > 0) {
      warnings.push(`Bỏ qua ${skippedJunk} mục hệ thống (macOS/Windows) trong ZIP.`);
    }

    const insensitive = new Map<string, AdmZip.IZipEntry>();
    for (const [path, entry] of byPath) {
      const key = path.toLowerCase();
      if (!insensitive.has(key)) insensitive.set(key, entry);
    }

    const readEntry = (entry: AdmZip.IZipEntry | undefined): Buffer | null => {
      if (!entry) return null;
      try {
        return entry.getData();
      } catch {
        return null;
      }
    };

    return {
      entries,
      files,
      warnings,
      read: (path) => readEntry(byPath.get(path)),
      readInsensitive: (path) => readEntry(insensitive.get(path.toLowerCase())),
    };
  }
}
