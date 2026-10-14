import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import type { ParsedExamFile } from '../exam-import.model';
import type { ExamFileParser } from './exam-file-parser';
import { parseTextToRows } from './text-line.parser';

/**
 * PDF parser: extracts the text layer with pdf-parse and runs the shared
 * heuristic line parser. Scanned/image-only PDFs have no text layer and are
 * rejected with a clear message (no OCR in scope).
 */
@Injectable()
export class PdfExamFileParser implements ExamFileParser {
  readonly format = 'pdf';
  readonly extensions = ['.pdf'];

  supports(fileName: string): boolean {
    return fileName.toLowerCase().endsWith('.pdf');
  }

  async parse(buffer: Buffer): Promise<ParsedExamFile> {
    let text = '';
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      text = result.text ?? '';
    } catch {
      throw new BadRequestException(
        'Không đọc được nội dung PDF. File có thể là ảnh scan hoặc bị hỏng — hãy dùng Excel/DOCX, hoặc PDF có lớp văn bản.',
      );
    } finally {
      const destroyable = parser as unknown as { destroy?: () => Promise<void> | void };
      try {
        await destroyable.destroy?.();
      } catch {
        /* ignore cleanup errors */
      }
    }

    if (!text.trim()) {
      throw new BadRequestException(
        'PDF không có lớp văn bản để trích xuất (có thể là ảnh scan). Hãy dùng Excel/DOCX.',
      );
    }

    return {
      rows: parseTextToRows(text),
      warnings: [
        'PDF được trích xuất văn bản tự động — kiểm tra kỹ cấu trúc (section/group/câu hỏi) ở bước xem trước.',
      ],
    };
  }
}
