import { BadRequestException, Injectable } from '@nestjs/common';
import type { ParsedExamFile } from '../exam-import.model';
import { ExcelExamFileParser } from '../parser/excel.parser';
import type { ExtractedZip } from './zip-extractor';

const DATA_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

export interface ParsedPackageExcel extends ParsedExamFile {
  /** Path of the sheet file inside the ZIP (for display/diagnostics). */
  sheetPath: string;
}

/**
 * Finds and reads the workbook inside the extracted ZIP.
 *
 * Convention: `questions.xlsx` at the package root (or inside one wrapper
 * folder — admins usually zip the extracted folder). Any other .xlsx/.csv is
 * accepted as a fallback with a warning, so a renamed sheet still imports.
 * Rows keep their Excel row numbers (`__excelRow`) for error reporting.
 */
@Injectable()
export class PackageExcelParser {
  constructor(private readonly excelParser: ExcelExamFileParser) {}

  async parse(zip: ExtractedZip): Promise<ParsedPackageExcel> {
    const candidates = zip.files
      .filter((file) => {
        const base = file.path.split('/').pop() ?? '';
        return (
          !base.startsWith('~$') &&
          DATA_EXTENSIONS.some((ext) => base.toLowerCase().endsWith(ext))
        );
      })
      // Prefer shallow paths — a wrapper folder ("toeic-test/questions.xlsx")
      // and the root file are both fine.
      .sort((a, b) => a.path.split('/').length - b.path.split('/').length);

    if (candidates.length === 0) {
      throw new BadRequestException(
        'Không tìm thấy questions.xlsx trong ZIP. Gói import phải chứa file bảng câu hỏi ' +
          '(.xlsx/.csv) — hãy tải lại template và điền dữ liệu vào sheet "Import".',
      );
    }

    const exact = candidates.find(
      (file) => (file.path.split('/').pop() ?? '').toLowerCase() === 'questions.xlsx',
    );
    const chosen = exact ?? candidates[0];
    const warnings: string[] = [];

    if (!exact) {
      if (candidates.length === 1) {
        warnings.push(
          `Không có file "questions.xlsx" — dùng "${chosen.path}" làm bảng câu hỏi.`,
        );
      } else {
        warnings.push(
          `Không có file "questions.xlsx" — dùng "${chosen.path}" (bỏ qua ${candidates.length - 1} file khác).`,
        );
      }
    }

    const buffer = zip.readInsensitive(chosen.path);
    if (!buffer?.length) {
      throw new BadRequestException(`Không đọc được file "${chosen.path}" từ ZIP.`);
    }

    const parsed = await this.excelParser.parse(buffer, chosen.path);
    return {
      rows: parsed.rows,
      warnings: [...warnings, ...parsed.warnings],
      sheetPath: chosen.path,
    };
  }
}
