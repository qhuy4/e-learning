import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
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
import { ExamPackageImporter } from './exam-package-importer';
import type { PackageImportPatch } from './package-import.model';

/** ZIP packages carry audio/images — 200MB covers a full TOEIC/IELTS test. */
const MAX_PACKAGE_FILE_SIZE = 200 * 1024 * 1024;

/** Text fields (the JSON "patch") may be big on heavily-edited packages. */
const MAX_TEXT_FIELD_SIZE = 10 * 1024 * 1024;

/** Guard rails for the client-supplied in-place patch (rows/edits/cell size). */
const PATCH_LIMITS = {
  maxRemovedRows: 2_000,
  maxEdits: 2_000,
  maxCellsPerRow: 40,
  maxCellLength: 10_000,
} as const;

interface UploadedFileLike {
  originalname: string;
  mimetype?: string;
  buffer: Buffer;
}

/**
 * Admin Exam Package (ZIP) import — sibling of AdminExamImportController
 * (Excel flow); routes are literal-suffixed so they never collide with
 * AdminExamController's `:id` routes.
 *
 *   GET  /admin/exams/:examId/import-template  → ZIP template (format-driven)
 *   POST /admin/exams/:examId/import/preview   → extract + validate (no writes)
 *   POST /admin/exams/:examId/import/confirm   → upload media + save (0 errors)
 */
@Controller('admin/exams')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminExamPackageImportController {
  constructor(private readonly importer: ExamPackageImporter) {}

  @Get(':examId/import-template')
  async getTemplate(
    @Param('examId', ParseIntPipe) examId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName } = await this.importer.buildTemplate(examId);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
      // Never serve a stale template from the browser cache.
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    });
    res.end(buffer);
  }

  /** Extract → parse → media match → validate (read-only, no DB/R2 writes). */
  @Post(':examId/import/preview')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_PACKAGE_FILE_SIZE, fieldSize: MAX_TEXT_FIELD_SIZE },
    }),
  )
  async preview(
    @Param('examId', ParseIntPipe) examId: number,
    @Body() body?: { patch?: string },
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<unknown> {
    return this.importer.preview(
      examId,
      this.assertFile(file),
      this.parsePatch(body?.patch),
    );
  }

  /** Re-runs the pipeline; writes sections + media + content only at 0 errors. */
  @Post(':examId/import/confirm')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_PACKAGE_FILE_SIZE, fieldSize: MAX_TEXT_FIELD_SIZE },
    }),
  )
  async confirm(
    @Param('examId', ParseIntPipe) examId: number,
    @Body() body?: { patch?: string },
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<unknown> {
    return this.importer.confirm(
      examId,
      this.assertFile(file),
      this.parsePatch(body?.patch),
    );
  }

  /**
   * The UI sends its in-place patch as a multipart text field ("patch" →
   * JSON string). Multer populates `req.body` with text fields, so
   * `@Body()` reads it after FileInterceptor ran. Absent/empty → no patch.
   */
  private parsePatch(raw?: string): PackageImportPatch | undefined {
    if (raw == null || String(raw).trim() === '') return undefined;
    let parsed: unknown;
    try {
      parsed = JSON.parse(String(raw));
    } catch {
      throw new BadRequestException('Trường "patch" không phải JSON hợp lệ.');
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new BadRequestException('Trường "patch" phải là một object JSON.');
    }
    const input = parsed as { removedRows?: unknown; edits?: unknown };
    const patch: PackageImportPatch = {};

    if (input.removedRows != null) {
      if (!Array.isArray(input.removedRows)) {
        throw new BadRequestException('patch.removedRows phải là mảng số dòng Excel.');
      }
      if (input.removedRows.length > PATCH_LIMITS.maxRemovedRows) {
        throw new BadRequestException(
          `patch.removedRows vượt giới hạn ${PATCH_LIMITS.maxRemovedRows} dòng.`,
        );
      }
      const rows: number[] = [];
      for (const value of input.removedRows) {
        const n = Number(value);
        if (!Number.isInteger(n) || n <= 0) {
          throw new BadRequestException(
            'patch.removedRows chỉ nhận số dòng Excel nguyên dương.',
          );
        }
        rows.push(n);
      }
      patch.removedRows = rows;
    }

    if (input.edits != null) {
      if (!Array.isArray(input.edits)) {
        throw new BadRequestException('patch.edits phải là mảng { excelRow, fields }.');
      }
      if (input.edits.length > PATCH_LIMITS.maxEdits) {
        throw new BadRequestException(
          `patch.edits vượt giới hạn ${PATCH_LIMITS.maxEdits} dòng sửa.`,
        );
      }
      const edits: NonNullable<PackageImportPatch['edits']> = [];
      for (const value of input.edits) {
        if (typeof value !== 'object' || value === null) {
          throw new BadRequestException('patch.edits[] phải là { excelRow, fields }.');
        }
        const entry = value as { excelRow?: unknown; fields?: unknown };
        const excelRow = Number(entry.excelRow);
        if (!Number.isInteger(excelRow) || excelRow <= 0) {
          throw new BadRequestException('patch.edits[].excelRow phải là số dòng nguyên dương.');
        }
        if (typeof entry.fields !== 'object' || entry.fields === null || Array.isArray(entry.fields)) {
          throw new BadRequestException('patch.edits[].fields phải là object { key: "value" }.');
        }
        const fields: Record<string, string> = {};
        const cells = Object.entries(entry.fields as Record<string, unknown>);
        if (cells.length > PATCH_LIMITS.maxCellsPerRow) {
          throw new BadRequestException(
            `patch.edits[].fields vượt giới hạn ${PATCH_LIMITS.maxCellsPerRow} ô/cột.`,
          );
        }
        for (const [key, cell] of cells) {
          if (typeof key !== 'string' || key === '' || key === '__excelRow') continue;
          const text =
            typeof cell === 'string' ||
            typeof cell === 'number' ||
            typeof cell === 'boolean'
              ? String(cell)
              : '';
          if (text.length > PATCH_LIMITS.maxCellLength) {
            throw new BadRequestException(
              `Ô "${key}" vượt giới hạn ${PATCH_LIMITS.maxCellLength} ký tự.`,
            );
          }
          fields[key] = text;
        }
        if (Object.keys(fields).length > 0) edits.push({ excelRow, fields });
      }
      if (edits.length > 0) patch.edits = edits;
    }

    return patch.removedRows || patch.edits ? patch : undefined;
  }

  private assertFile(file?: Express.Multer.File): UploadedFileLike {
    if (!file || !file.buffer?.length) {
      throw new BadRequestException('Thiếu file ZIP tải lên (field "file").');
    }
    const name = (file.originalname ?? '').toLowerCase();
    if (!name.endsWith('.zip')) {
      throw new BadRequestException(
        `Chỉ chấp nhận file .ZIP (nhận "${file.originalname || 'file không rõ'}") — hãy nén questions.xlsx + thư mục media thành ZIP.`,
      );
    }
    return file;
  }
}
