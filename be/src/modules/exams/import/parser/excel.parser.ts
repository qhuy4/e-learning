import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import type { ImportRow, ParsedExamFile } from '../exam-import.model';
import type { ExamFileParser } from './exam-file-parser';

/** ImportRow keys written by the header mapper (meta keys like `__excelRow` excluded). */
type RowKey = Exclude<keyof ImportRow, '__excelRow'>;

/** Canonical ImportRow key per normalized header ("option_a", "Correct Answer", ...). */
const HEADER_MAP: Record<string, RowKey> = {
  // Vietnamese headers (normalizeHeader folds accents: "Phần thi" -> "phan_thi")
  phan: 'section',
  phan_thi: 'section',
  nhom: 'group',
  nhom_cau: 'group',
  ten_nhom: 'group',
  loai_nhom: 'groupType',
  loai_cau_hoi: 'questionType',
  kieu_cau_hoi: 'questionType',
  noi_dung_cau_hoi: 'question',
  phuong_an_a: 'optionA',
  phuong_an_b: 'optionB',
  phuong_an_c: 'optionC',
  phuong_an_d: 'optionD',
  dap_an_dung: 'correctAnswer',
  thu_tu: 'position',
  vi_tri: 'position',

  section: 'section',
  part: 'section',
  section_part: 'section',
  group: 'group',
  group_name: 'group',
  group_title: 'group',
  group_type: 'groupType',
  grouptype: 'groupType',
  material_type: 'materialType',
  materialtype: 'materialType',
  material_title: 'materialTitle',
  material_name: 'materialTitle',
  material_content: 'materialContent',
  material_url: 'materialContent',
  material_link: 'materialContent',
  question: 'question',
  question_text: 'question',
  question_content: 'question',
  cau_hoi: 'question',
  question_type: 'questionType',
  questiontype: 'questionType',
  type: 'questionType',
  qtype: 'questionType',
  option_a: 'optionA',
  optiona: 'optionA',
  a: 'optionA',
  answer_a: 'optionA',
  dap_an_a: 'optionA',
  option_b: 'optionB',
  optionb: 'optionB',
  b: 'optionB',
  answer_b: 'optionB',
  dap_an_b: 'optionB',
  option_c: 'optionC',
  optionc: 'optionC',
  c: 'optionC',
  answer_c: 'optionC',
  dap_an_c: 'optionC',
  option_d: 'optionD',
  optiond: 'optionD',
  d: 'optionD',
  answer_d: 'optionD',
  dap_an_d: 'optionD',
  correct_answer: 'correctAnswer',
  correctanswer: 'correctAnswer',
  answer: 'correctAnswer',
  answers: 'correctAnswer',
  answer_key: 'correctAnswer',
  key: 'correctAnswer',
  dap_an: 'correctAnswer',
  explanation: 'explanation',
  explain: 'explanation',
  giai_thich: 'explanation',
  position: 'position',
  pos: 'position',
  order: 'position',
  stt: 'position',
  points: 'points',
  point: 'points',
  score: 'points',
  diem: 'points',

  // ---- ZIP package template columns ----
  // "Media filename" — path of the audio/image file inside the ZIP package.
  media: 'media',
  media_file: 'media',
  media_filename: 'media',
  media_path: 'media',
  media_name: 'media',
  media_url: 'media',
  file: 'media',
  file_name: 'media',
  filename: 'media',
  audio_file: 'media',
  image_file: 'media',
  audio_filename: 'media',
  image_filename: 'media',
  ten_file: 'media',
  // "Question Number" — informational numbering (Câu 42), never drives order.
  question_number: 'questionNumber',
  questionnumber: 'questionNumber',
  q_number: 'questionNumber',
  qno: 'questionNumber',
  so_cau: 'questionNumber',
  cau_so: 'questionNumber',
};

/**
 * Folds case/accents/punctuation to a-z0-9_ so header aliases match both
 * English ("Correct Answer") and Vietnamese ("Đáp án" -> "dap_an") labels.
 */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[đĐ]/g, 'd')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function isEmptyRow(row: ImportRow): boolean {
  return Object.values(row).every((v) => String(v ?? '').trim() === '');
}

function isGuideSheetName(name: string): boolean {
  const n = name.toLowerCase();
  return ['readme', 'guide', 'note', 'huong', 'hướng', 'ghi', 'example', 'ví dụ', 'vi du'].some(
    (k) => n.includes(k),
  );
}

/** How many top rows of a sheet are scanned when looking for the header row. */
const MAX_HEADER_SCAN_ROWS = 10;

interface HeaderRow {
  index: number;
  keys: (RowKey | null)[];
}

/**
 * Locates the header row among the first rows of the sheet — files often have
 * a title/intro row above the real headers. A wide header (4+ known columns)
 * always wins; otherwise the first row is trusted, and a header below title
 * rows must match at least two known columns.
 */
function findHeaderRow(aoa: unknown[][]): HeaderRow | null {
  const limit = Math.min(aoa.length, MAX_HEADER_SCAN_ROWS);
  const scored: { index: number; keys: (RowKey | null)[]; score: number }[] = [];
  for (let r = 0; r < limit; r++) {
    const keys = (aoa[r] ?? []).map(
      (cell) => HEADER_MAP[normalizeHeader(String(cell ?? ''))] ?? null,
    );
    const score = keys.filter((key) => key !== null).length;
    if (score > 0) scored.push({ index: r, keys, score });
  }
  if (scored.length === 0) return null;

  // Wide header (the normal template) — beats a keyword-ish title row above it.
  const strong = scored.find((row) => row.score >= 4);
  if (strong) return { index: strong.index, keys: strong.keys };

  // Header on the very first row (even a minimal single-column file).
  if (scored[0].index === 0) return { index: 0, keys: scored[0].keys };

  // Header below title rows — needs at least two known columns to be trusted.
  const header = scored.find((row) => row.score >= 2);
  return header ? { index: header.index, keys: header.keys } : null;
}

/** Human-readable peek at the first non-empty rows — used in warnings/errors. */
function firstRowsPreview(aoa: unknown[][]): string {
  for (let r = 0; r < Math.min(aoa.length, 3); r++) {
    const values = (aoa[r] ?? [])
      .map((cell) => String(cell ?? '').trim())
      .filter((value) => value !== '');
    if (values.length > 0) {
      const line = values.slice(0, 5).join(' | ');
      return line.length > 80 ? `${line.slice(0, 80)}…` : line;
    }
  }
  return '(sheet trống)';
}

@Injectable()
export class ExcelExamFileParser implements ExamFileParser {
  readonly format = 'excel';
  readonly extensions = ['.xlsx', '.xls', '.csv'];

  supports(fileName: string): boolean {
    return this.extensions.some((ext) => fileName.toLowerCase().endsWith(ext));
  }

  async parse(buffer: Buffer, fileName?: string): Promise<ParsedExamFile> {
    const workbook = this.readWorkbook(buffer, fileName);
    const rows: ImportRow[] = [];
    const warnings: string[] = [];
    let sawKnownHeader = false;
    const headerOnlySheets: string[] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        defval: '',
        raw: false,
      });
      if (aoa.length === 0) continue;

      // The header may sit below title/intro rows — scan the top of the sheet.
      const header = findHeaderRow(aoa);
      if (!header) {
        if (!isGuideSheetName(sheetName)) {
          warnings.push(
            `Bỏ qua sheet "${sheetName}": không nhận diện được cột dữ liệu (cần ít nhất cột "section" hoặc "question"). ` +
              `Đầu sheet: ${firstRowsPreview(aoa)}`,
          );
        }
        continue;
      }
      sawKnownHeader = true;
      const mappedKeys = header.keys;

      // Section fill-down supports merged/blank section cells.
      const hasSectionColumn = mappedKeys.includes('section');
      const fallbackSection =
        !hasSectionColumn && !/^sheet\d*$/i.test(sheetName.trim()) ? sheetName.trim() : '';
      let currentSection = '';

      const dataRows = aoa.slice(header.index + 1);
      if (dataRows.length === 0) {
        // Recognized header but no data rows (e.g. an outdated header-only template).
        headerOnlySheets.push(sheetName);
        continue;
      }

      for (const [i, cells] of dataRows.entries()) {
        const row: ImportRow = {};
        mappedKeys.forEach((key, ci) => {
          if (!key) return;
          row[key] = String(cells[ci] ?? '').trim();
        });

        if (row.section) currentSection = row.section;
        else if (currentSection) row.section = currentSection;
        else if (fallbackSection) row.section = fallbackSection;

        if (!isEmptyRow(row)) {
          // aoa index header.index + 1 + i -> Excel row header.index + 2 + i
          // (aoa row 0 = Excel row 1). Tag AFTER the empty check so meta keys
          // never make a scaffold row look like it has content.
          row.__excelRow = header.index + 2 + i;
          rows.push(row);
        }
      }
    }

    if (rows.length === 0) {
      if (headerOnlySheets.length > 0 || sawKnownHeader) {
        const sheetList =
          headerOnlySheets.length > 0
            ? headerOnlySheets.map((s) => `"${s}"`).join(', ')
            : 'file';
        throw new BadRequestException(
          `Sheet ${sheetList} có đúng cấu trúc cột nhưng chưa có dòng dữ liệu nào. ` +
            'Nếu bạn đang dùng file mẫu tải trước đó, hãy TẢI LẠI template mới nhất (phiên bản mới đã có sẵn dữ liệu mẫu) rồi nhập dữ liệu vào sheet "Import".',
        );
      }
      const sheetDiag = workbook.SheetNames
        .slice(0, 3)
        .map((name) => {
          const ws = workbook.Sheets[name];
          if (!ws) return `"${name}": (không đọc được sheet)`;
          const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, {
            header: 1,
            defval: '',
            raw: false,
          });
          return `"${name}": ${firstRowsPreview(aoa)}`;
        })
        .join(' • ');
      throw new BadRequestException(
        `Không nhận diện được cột dữ liệu trong file. Đầu các sheet tìm thấy: ${sheetDiag}. ` +
          'Dòng tiêu đề phải nằm trong 10 dòng đầu của sheet và trùng tên cột với template ' +
          '(section, question, option_a…option_d, correct_answer). ' +
          'Hãy tải template mới nhất và nhập dữ liệu vào sheet "Import".',
      );
    }
    return { rows, warnings };
  }

  private readWorkbook(buffer: Buffer, fileName?: string): XLSX.WorkBook {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      if (workbook.SheetNames.length > 0) return workbook;
    } catch {
      // fall through to the text (CSV) attempt below
    }
    try {
      // Text exports (CSV with unusual encoding) can fail binary sniffing.
      const workbook = XLSX.read(buffer.toString('utf8'), { type: 'string' });
      if (workbook.SheetNames.length > 0) return workbook;
    } catch {
      // fall through to the error below
    }
    throw new BadRequestException(
      `Không đọc được file Excel${fileName ? ` "${fileName}"` : ''}. ` +
        'File có thể hỏng hoặc không phải .xlsx/.xls/.csv — hãy tải template mới nhất và nhập dữ liệu vào sheet "Import".',
    );
  }
}
