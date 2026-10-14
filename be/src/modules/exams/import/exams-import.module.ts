import { Module } from '@nestjs/common';
import { StorageModule } from '@/common/storage/storage.module';
import { ExamsModule } from '../exams.module';
import { AdminExamImportController } from './admin-exam-import.controller';
import { ExamImportService } from './exam-import.service';
import { EXAM_FILE_PARSERS, ExamFileParserRegistry } from './parser/exam-file-parser';
import { ExcelExamFileParser } from './parser/excel.parser';
import { DocxExamFileParser } from './parser/docx.parser';
import { PdfExamFileParser } from './parser/pdf.parser';
import { EXAM_TYPE_MAPPERS, ExamTypeMapperRegistry } from './mapper/exam-type.mapper';
import { ToeicExamTypeMapper } from './mapper/toeic-exam-type.mapper';
import { IeltsExamTypeMapper } from './mapper/ielts-exam-type.mapper';
import { ExamImportNormalizer } from './normalizer/exam-import.normalizer';
import { ExamImportValidator } from './validator/exam-import.validator';
import { AdminExamPackageImportController } from './package/admin-exam-package.controller';
import { ExamPackageImporter } from './package/exam-package-importer';
import { MediaResolver } from './package/media-resolver';
import { PackageExcelParser } from './package/package-excel.parser';
import { PackageTemplateGenerator } from './package/template-generator';
import { PackageValidator } from './package/package-validator';
import { ZipExtractor } from './package/zip-extractor';

/**
 * Exam Import feature — deliberately separate from Exam CRUD:
 *
 *   Import -> Parser (excel/pdf/docx) -> Normalizer (+ exam-type mappers)
 *          -> Validator -> Preview -> Save
 *
 *   ZIP package import (Admin): TemplateGenerator -> ZipExtractor ->
 *     PackageExcelParser -> MediaResolver -> PackageValidator -> confirm/save
 *
 * Extension points (no DB / CRUD changes needed):
 *   - new file format  -> implement ExamFileParser, add to EXAM_FILE_PARSERS
 *   - new exam type    -> implement ExamTypeMapper, add to EXAM_TYPE_MAPPERS
 *
 * Repository tokens are provided by ExamsModule (exported there);
 * StorageModule provides FILE_STORAGE (R2) for package media upload.
 */
@Module({
  imports: [ExamsModule, StorageModule],
  controllers: [AdminExamImportController, AdminExamPackageImportController],
  providers: [
    // file-format parsers
    ExcelExamFileParser,
    DocxExamFileParser,
    PdfExamFileParser,
    {
      provide: EXAM_FILE_PARSERS,
      useFactory: (excel, docx, pdf) => [excel, docx, pdf],
      inject: [ExcelExamFileParser, DocxExamFileParser, PdfExamFileParser],
    },
    ExamFileParserRegistry,
    // exam-type mapping rules
    ToeicExamTypeMapper,
    IeltsExamTypeMapper,
    {
      provide: EXAM_TYPE_MAPPERS,
      useFactory: (toeic, ielts) => [toeic, ielts],
      inject: [ToeicExamTypeMapper, IeltsExamTypeMapper],
    },
    ExamTypeMapperRegistry,
    // pipeline
    ExamImportNormalizer,
    ExamImportValidator,
    ExamImportService,
    // ZIP package import (Admin)
    ZipExtractor,
    PackageTemplateGenerator,
    PackageExcelParser,
    MediaResolver,
    PackageValidator,
    ExamPackageImporter,
  ],
})
export class ExamsImportModule {}
