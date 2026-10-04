import { BadRequestException, Injectable } from '@nestjs/common';
import { inflateRawSync } from 'zlib';
import type { ParsedExamFile } from '../exam-import.model';
import type { ExamFileParser } from './exam-file-parser';
import { parseTextToRows } from './text-line.parser';

/**
 * Minimal dependency-free DOCX reader: a .docx file is a ZIP containing
 * word/document.xml. Only that entry is extracted (stored or deflated).
 */
function readDocumentXml(buffer: Buffer): string {
  // Locate End Of Central Directory record.
  let eocd = -1;
  const from = buffer.length - 22;
  const to = Math.max(0, buffer.length - 22 - 65535);
  for (let i = from; i >= to; i--) {
    if (i + 4 <= buffer.length && buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('Not a ZIP archive');

  const entryCount = buffer.readUInt16LE(eocd + 10);
  let p = buffer.readUInt32LE(eocd + 16);

  for (let n = 0; n < entryCount; n++) {
    if (p + 46 > buffer.length || buffer.readUInt32LE(p) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(p + 10);
    const compSize = buffer.readUInt32LE(p + 20);
    const nameLen = buffer.readUInt16LE(p + 28);
    const extraLen = buffer.readUInt16LE(p + 30);
    const commentLen = buffer.readUInt16LE(p + 32);
    const localOffset = buffer.readUInt32LE(p + 42);
    const name = buffer.toString('utf8', p + 46, p + 46 + nameLen);

    if (name === 'word/document.xml') {
      if (localOffset + 30 > buffer.length) throw new Error('Corrupt ZIP local header');
      const localNameLen = buffer.readUInt16LE(localOffset + 26);
      const localExtraLen = buffer.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localNameLen + localExtraLen;
      const data = buffer.subarray(dataStart, dataStart + compSize);
      if (method === 0) return bufferToString(data);
      if (method === 8) return bufferToString(inflateRawSync(data));
      throw new Error(`Unsupported ZIP compression method ${method}`);
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error('word/document.xml not found');
}

function bufferToString(data: Buffer): string {
  // Strip UTF-8 BOM if present.
  if (data.length >= 3 && data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) {
    return data.subarray(3).toString('utf8');
  }
  return data.toString('utf8');
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function docxToText(buffer: Buffer): string {
  const xml = readDocumentXml(buffer);
  const withBreaks = xml
    .replace(/<w:tab[^>]*\/>/g, '\t')
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<\/w:tc>/g, '\t')
    .replace(/<\/w:tr>/g, '\n')
    .replace(/<[^>]+>/g, '');
  return decodeXmlEntities(withBreaks);
}

@Injectable()
export class DocxExamFileParser implements ExamFileParser {
  readonly format = 'docx';
  readonly extensions = ['.docx'];

  supports(fileName: string): boolean {
    return fileName.toLowerCase().endsWith('.docx');
  }

  async parse(buffer: Buffer, fileName: string): Promise<ParsedExamFile> {
    let text: string;
    try {
      text = docxToText(buffer);
    } catch {
      throw new BadRequestException(
        `Không đọc được file DOCX "${fileName}". File có thể hỏng, hoặc là định dạng .doc cũ — hãy lưu lại thành .docx.`,
      );
    }
    if (!text.trim()) {
      throw new BadRequestException('File DOCX không có nội dung văn bản.');
    }
    return {
      rows: parseTextToRows(text),
      warnings: [
        'DOCX được xử lý tự động — kiểm tra kỹ cấu trúc (section/group/câu hỏi) ở bước xem trước.',
      ],
    };
  }
}
