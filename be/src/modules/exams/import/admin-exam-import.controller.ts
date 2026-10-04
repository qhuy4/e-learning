import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import type { NormalizedExamImport } from './exam-import.model';
import type { ExamTemplateSection } from './exam-import-template';
import { ExamImportService } from './exam-import.service';

const MAX_IMPORT_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface ImportBody {
  examId?: number | string;
  data?: NormalizedExamImport;
}

@Controller('admin/exam-imports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminExamImportController {
  constructor(private readonly importService: ExamImportService) {}

  /**
   * Downloadable standard Excel template.
   * - `?examId=` → scaffold rows come from that exam's parts.
   * - `?sections=` (JSON `[{name, questionCount}]`, optional `?title=`) → scaffold
   *   rows come from the given part list (template BEFORE the exam exists).
   * - neither → generic sample template.
   */
  @Get('template')
  async getTemplate(
    @Query('examId') examId: string | undefined,
    @Query('sections') sections: string | undefined,
    @Query('title') title: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const raw = (examId ?? '').trim();
    const id = raw === '' ? undefined : this.parseExamId(raw);
    const customSections = sections ? this.parseSections(sections) : undefined;
    const examTitle = (title ?? '').trim() || undefined;
    const { buffer, fileName } = await this.importService.buildTemplate(id, {
      sections: customSections,
      title: examTitle,
    });
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
      // Never serve a stale template from the browser cache (old header-only
      // versions caused "no data found" errors on re-upload).
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    });
    res.end(buffer);
  }

  /** Upload -> parse -> normalize -> validate -> preview (nothing is saved). */
  @Post('preview')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_IMPORT_FILE_SIZE } }),
  )
  preview(
    @Body('examId') examId: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<unknown> {
    if (!file || !file.buffer?.length) {
      throw new BadRequestException('Thiếu file tải lên (field "file").');
    }
    const id = this.parseExamId(examId);
    return this.importService.preview(id, file);
  }

  /** Re-validate after Admin edited the preview data. */
  @Post('validate')
  validate(@Body() body: ImportBody): Promise<unknown> {
    const id = this.parseExamId(body?.examId);
    return this.importService.validate(id, body?.data as NormalizedExamImport);
  }

  /** Save the validated structure into the exam (replaces section content). */
  @Post('save')
  save(@Body() body: ImportBody): Promise<unknown> {
    const id = this.parseExamId(body?.examId);
    return this.importService.save(id, body?.data as NormalizedExamImport);
  }

  private parseExamId(value: number | string | undefined): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('examId không hợp lệ.');
    }
    return id;
  }

  /** `?sections=` query → validated part list (JSON array, max 60 parts). */
  private parseSections(raw: string): ExamTemplateSection[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new BadRequestException('Tham số sections phải là JSON hợp lệ.');
    }
    if (!Array.isArray(parsed)) {
      throw new BadRequestException('Tham số sections phải là một mảng.');
    }
    if (parsed.length === 0 || parsed.length > 60) {
      throw new BadRequestException('Danh sách phần thi phải có từ 1 đến 60 phần.');
    }
    return parsed.map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new BadRequestException(`Phần thi thứ ${index + 1} không hợp lệ.`);
      }
      const entry = item as { name?: unknown; questionCount?: unknown };
      const name = typeof entry.name === 'string' ? entry.name.trim() : '';
      if (!name) {
        throw new BadRequestException(`Phần thi thứ ${index + 1} thiếu tên.`);
      }
      const count =
        entry.questionCount === undefined || entry.questionCount === null || entry.questionCount === ''
          ? 0
          : Number(entry.questionCount);
      if (!Number.isFinite(count) || count < 0 || count > 1000) {
        throw new BadRequestException(`Số câu của "${name}" không hợp lệ (0–1000).`);
      }
      return { name, questionCount: Math.round(count) };
    });
  }
}
