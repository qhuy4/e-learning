import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { ParsedExamFile } from '../exam-import.model';

export const EXAM_FILE_PARSERS = 'EXAM_FILE_PARSERS';

/**
 * Pluggable file-format parser.
 * Implement this interface and register the class in EXAM_FILE_PARSERS
 * (see exams-import.module.ts) to support a new upload format.
 */
export interface ExamFileParser {
  readonly format: string;
  readonly extensions: string[];
  supports(fileName: string, mimeType?: string): boolean;
  parse(buffer: Buffer, fileName: string): Promise<ParsedExamFile>;
}

@Injectable()
export class ExamFileParserRegistry {
  private readonly parsers: ExamFileParser[];

  constructor(@Inject(EXAM_FILE_PARSERS) parsers: ExamFileParser[]) {
    this.parsers = parsers;
  }

  resolve(fileName: string, mimeType?: string): ExamFileParser {
    const parser = this.parsers.find((p) => p.supports(fileName, mimeType));
    if (!parser) {
      const supported = this.parsers.flatMap((p) => p.extensions).join(', ');
      throw new BadRequestException(
        `Định dạng file "${fileName}" không được hỗ trợ. Chỉ nhận: ${supported}`,
      );
    }
    return parser;
  }
}
