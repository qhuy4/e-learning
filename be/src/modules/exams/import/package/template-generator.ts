import { BadRequestException, Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';
import * as XLSX from 'xlsx';
import type { ExamImportContext } from '../exam-import.model';
import { ExamTypeMapperRegistry } from '../mapper/exam-type.mapper';
import type { PackageTemplateSection } from './package-import.model';

/** Excel columns of the package template (kept in sync with HEADER_MAP). */
const HEADER: string[] = [
  'Section/Part',
  'Group',
  'Group Type',
  'Material Type',
  'Material Title',
  'Material Content',
  'Media filename',
  'Question',
  'Question Type',
  'Question Number',
  'Option A',
  'Option B',
  'Option C',
  'Option D',
  'Correct Answer',
  'Explanation',
  'Expected questions',
];

const README_NAME = 'README.txt';
const EXCEL_NAME = 'questions.xlsx';

/** Filesystem-safe folder name per section ("Section 1 / Part 1" -> "Section 1 - Part 1"). */
function sectionFolderName(name: string): string {
  const cleaned = name
    .replace(/[<>:"/\\|?*]+/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '')
    .slice(0, 60)
    .trim();
  return cleaned || 'Phần thi';
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'de-thi'
  );
}

/**
 * Builds the downloadable ZIP template from the exam's format — fully dynamic:
 * sections/folders/hints all come from the DB (ExamFormatSection) + the
 * exam-type mappers. Nothing TOEIC/IELTS specific is hardcoded here.
 *
 *   <slug>-import-package.zip
 *     questions.xlsx          — sheet "Import" (scaffold rows per part) +
 *                               sheet "Hướng dẫn"
 *     README.txt              — quick steps
 *     <Phần>/audio/           — one folder pair per part of the format
 *     <Phần>/images/
 */
@Injectable()
export class PackageTemplateGenerator {
  constructor(private readonly mapperRegistry: ExamTypeMapperRegistry) {}

  build(params: {
    title: string;
    sections: PackageTemplateSection[];
    ctx: ExamImportContext;
  }): { buffer: Buffer; fileName: string } {
    const { title, sections, ctx } = params;
    if (sections.length === 0) {
      throw new BadRequestException(
        'Đề thi chưa có phần thi (format chưa cấu trúc) — không thể tạo template ZIP.',
      );
    }

    const xlsxBuffer = this.buildWorkbook(title, sections, ctx);
    const readme = this.buildReadme(title, sections);

    const zip = new AdmZip();
    zip.addFile(EXCEL_NAME, xlsxBuffer);
    zip.addFile(README_NAME, Buffer.from(readme, 'utf8'));

    // One audio/images folder pair per part — deduplicated by folder name.
    const usedFolders = new Set<string>();
    for (const section of sections) {
      const base = sectionFolderName(section.name);
      let folder = base;
      let n = 2;
      while (usedFolders.has(folder.toLowerCase())) folder = `${base}-${n++}`;
      usedFolders.add(folder.toLowerCase());
      zip.addFile(`${folder}/audio/`, Buffer.alloc(0));
      zip.addFile(`${folder}/images/`, Buffer.alloc(0));
    }

    return {
      buffer: zip.toBuffer(),
      fileName: `${slugify(title)}-import-package.zip`,
    };
  }

  private buildWorkbook(
    title: string,
    sections: PackageTemplateSection[],
    ctx: ExamImportContext,
  ): Buffer {
    const importRows: (string | number)[][] = [HEADER];
    for (const section of sections) {
      const scaffold: (string | number)[] = HEADER.map(() => '');
      scaffold[0] = section.name;
      scaffold[HEADER.length - 1] = section.questionCount || '';
      importRows.push(scaffold);
    }

    const guideRows: string[][] = [
      ['HƯỚNG DẪN IMPORT GÓI ZIP', `Đề: ${title}`],
      ['', ''],
      ['Bước 1', 'Điền dữ liệu vào sheet "Import" (mỗi dòng = 1 câu hỏi hoặc 1 dòng tài liệu).'],
      [
        'Bước 2',
        'Đặt file audio/ảnh vào đúng thư mục phần thi trong ZIP này (vd: Part-1/audio/p1-g1.mp3) và ghi ĐÚNG đường dẫn tương đối vào cột "Media filename".',
      ],
      [
        'Bước 3',
        'Nén lại TOÀN BỘ thư mục thành file .ZIP rồi tải lên trang "Import ZIP" của đề thi → Xem trước → Xác nhận import.',
      ],
      ['', ''],
      ['Cột Section/Part', 'BẮT BUỘC. Trùng tên phần thi của đề (xem danh sách ở sheet "Import").'],
      [
        'Cột Group',
        'Để trống = nối với group phía trên; ghi "-" = câu hỏi trực tiếp. Các phần bắt buộc group được liệt kê bên dưới.',
      ],
      ['Cột Group Type', 'AUDIO / PASSAGE / IMAGE / CUSTOM — tự suy luận theo loại đề nếu để trống.'],
      [
        'Cột Material Type',
        'AUDIO / IMAGE / PASSAGE / TEXT — dòng tài liệu (audio, ảnh, bài đọc) để trống question.',
      ],
      [
        'Cột Media filename',
        'Đường dẫn file trong ZIP (vd: Part-2/audio/g1.mp3). File phải tồn tại đúng đường dẫn; audio: mp3/wav/m4a/ogg/aac/flac/webm, ảnh: png/jpg/jpeg/webp/gif/svg/bmp/avif.',
      ],
      ['Cột Question Type', 'MULTIPLE_CHOICE / MULTI_SELECT / TRUE_FALSE / FILL_BLANK / SHORT_ANSWER / ESSAY / AUDIO_RECORD / MATCHING — tự suy luận nếu trống.'],
      ['Cột Question Number', 'Số câu hiển thị (vd: 42) — chỉ để đối chiếu, không quyết định thứ tự.'],
      ['Cột Options (A–D)', 'Phương án trắc nghiệm; cột Correct Answer ghi chữ cái (AC nếu nhiều đáp án), TRUE/FALSE, hoặc nội dung đáp án (FILL_BLANK).'],
      ['Cột Expected questions', 'Chỉ là gợi ý số câu từng phần từ format — không import.'],
      ['', ''],
      ['Ví dụ — dòng tài liệu audio', 'Section/Part=Part 2 | Group=Group 1 | Group Type=AUDIO | Material Type=AUDIO | Media filename=Part-2/audio/g1.mp3'],
      [
        'Ví dụ — câu hỏi có audio/ảnh chung',
        'Section/Part=Part 2 | Group=Group 1 | Question Number=1 | Question=... | Correct Answer=A (media trên dòng câu hỏi sẽ gắn vào group)',
      ],
      ['Ví dụ — câu hỏi trực tiếp', 'Section/Part=Part 5 | Group=- | Question Number=1 | Question=... | Option A..D | Correct Answer=B'],
      ['', ''],
      ['Quy tắc quan trọng', 'Chỉ import khi Xem trước không còn lỗi đỏ — hệ thống KHÔNG import khi còn lỗi.'],
    ];

    const grouped = sections
      .filter((section) => {
        const mapper = this.mapperRegistry.resolve(ctx.examTypeName);
        return mapper?.prefersGrouped({ ...ctx, sectionName: section.name }) === true;
      })
      .map((s) => s.name);
    if (grouped.length > 0) {
      guideRows.push([
        'Phần BẮT BUỘC có Group',
        `${grouped.join(', ')} — mỗi câu phải điền cột "Group".`,
      ]);
    }

    const importSheet = XLSX.utils.aoa_to_sheet(importRows);
    importSheet['!cols'] = HEADER.map((header) => ({
      wch: header === 'Question' ? 46 : header === 'Explanation' ? 30 : Math.max(12, header.length + 4),
    }));
    const guideSheet = XLSX.utils.aoa_to_sheet(guideRows);
    guideSheet['!cols'] = [{ wch: 30 }, { wch: 110 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, importSheet, 'Import');
    XLSX.utils.book_append_sheet(workbook, guideSheet, 'Hướng dẫn');
    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  }

  private buildReadme(title: string, sections: PackageTemplateSection[]): string {
    const partList = sections.map((s) => `- ${s.name} (${s.questionCount || '?'} câu)`).join('\n');
    return [
      `GÓI IMPORT ĐỀ THI — ${title}`,
      '=====================================',
      '',
      'Các bước:',
      '1. Mở questions.xlsx, điền dữ liệu vào sheet "Import" (đọc sheet "Hướng dẫn").',
      '2. Đặt file audio/ảnh vào đúng thư mục phần thi của ZIP:',
      partList,
      '   Mỗi phần có 2 thư mục: <phần>/audio/ và <phần>/images/.',
      '3. Ghi ĐÚNG đường dẫn file vào cột "Media filename" (vd: Part-1/images/p1-1.jpg).',
      '4. Nén lại TOÀN BỘ thư mục thành file .ZIP (giữ nguyên cấu trúc).',
      '5. Admin → Đề thi → Import ZIP → tải lên → Xem trước → Xác nhận import.',
      '',
      'Lưu ý:',
      '- Section/Part phải trùng tên phần thi của đề thi.',
      '- Chỉ xác nhận import khi Xem trước không còn lỗi.',
      '- File media sai đường dẫn/thiếu sẽ hiện lỗi kèm dòng Excel cần sửa.',
      '',
    ].join('\n');
  }
}
