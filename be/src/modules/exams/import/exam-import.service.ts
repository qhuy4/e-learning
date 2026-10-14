import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Exam } from '../domain/entity/exam.entity';
import type { ExamSection } from '../domain/entity/exam-section.entity';
import { ExamGroupType } from '../domain/enums/exam-group-type.enum';
import type { IExamFormatRepository } from '../domain/repository/exam-format.repository';
import { EXAM_FORMAT_REPOSITORY } from '../domain/repository/exam-format.repository';
import type { IExamGroupMaterialRepository } from '../domain/repository/exam-group-material.repository';
import { EXAM_GROUP_MATERIAL_REPOSITORY } from '../domain/repository/exam-group-material.repository';
import type { IExamOptionRepository } from '../domain/repository/exam-option.repository';
import { EXAM_OPTION_REPOSITORY } from '../domain/repository/exam-option.repository';
import type { IExamQuestionGroupRepository } from '../domain/repository/exam-question-group.repository';
import { EXAM_QUESTION_GROUP_REPOSITORY } from '../domain/repository/exam-question-group.repository';
import type { IExamQuestionRepository } from '../domain/repository/exam-question.repository';
import { EXAM_QUESTION_REPOSITORY } from '../domain/repository/exam-question.repository';
import type { IExamRepository } from '../domain/repository/exam.repository';
import { EXAM_REPOSITORY } from '../domain/repository/exam.repository';
import type { IExamSectionRepository } from '../domain/repository/exam-section.repository';
import { EXAM_SECTION_REPOSITORY } from '../domain/repository/exam-section.repository';
import type { IExamTypeRepository } from '../domain/repository/exam-type.repository';
import { EXAM_TYPE_REPOSITORY } from '../domain/repository/exam-type.repository';
import { ExamGroupMaterial } from '../domain/entity/exam-group-material.entity';
import { ExamOption } from '../domain/entity/exam-option.entity';
import { ExamQuestion } from '../domain/entity/exam-question.entity';
import { ExamQuestionGroup } from '../domain/entity/exam-question-group.entity';
import type {
  ExamImportContext,
  ExamImportPreview,
  ExamImportSaveSummary,
  ImportValidationReport,
  NormalizedExamImport,
  NormalizedQuestion,
} from './exam-import.model';
import {
  buildExamImportTemplateBuffer,
  buildExamImportTemplateFileName,
  type ExamTemplateSection,
} from './exam-import-template';
import { ExamImportNormalizer } from './normalizer/exam-import.normalizer';
import { ExamFileParserRegistry } from './parser/exam-file-parser';
import { ExamImportValidator } from './validator/exam-import.validator';

interface UploadedFileLike {
  originalname: string;
  mimetype?: string;
  buffer: Buffer;
}

export interface ImportBodyContext {
  exam: Exam;
  sections: ExamSection[];
  ctx: ExamImportContext;
}

/**
 * Orchestrates the import pipeline, kept separate from Exam CRUD:
 *
 *   Upload -> Parser -> Normalizer -> Validator -> Preview (Admin edits)
 *          -> Validator again -> Save (replaces the content of exam sections)
 */
@Injectable()
export class ExamImportService {
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
    @Inject(EXAM_SECTION_REPOSITORY)
    private readonly sectionRepo: IExamSectionRepository,
    @Inject(EXAM_FORMAT_REPOSITORY)
    private readonly formatRepo: IExamFormatRepository,
    @Inject(EXAM_TYPE_REPOSITORY)
    private readonly typeRepo: IExamTypeRepository,
    @Inject(EXAM_QUESTION_GROUP_REPOSITORY)
    private readonly groupRepo: IExamQuestionGroupRepository,
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly questionRepo: IExamQuestionRepository,
    @Inject(EXAM_OPTION_REPOSITORY)
    private readonly optionRepo: IExamOptionRepository,
    @Inject(EXAM_GROUP_MATERIAL_REPOSITORY)
    private readonly materialRepo: IExamGroupMaterialRepository,
    private readonly parserRegistry: ExamFileParserRegistry,
    private readonly normalizer: ExamImportNormalizer,
    private readonly validator: ExamImportValidator,
  ) {}

  async preview(examId: number, file: UploadedFileLike): Promise<ExamImportPreview> {
    const { sections, ctx } = await this.context(examId);

    const parser = this.parserRegistry.resolve(file.originalname, file.mimetype);
    const parsed = await parser.parse(file.buffer, file.originalname);

    const normalized = this.normalizer.normalize(parsed.rows, ctx);
    const parseIssues = [
      ...parsed.warnings.map((message) => ({
        severity: 'warning' as const,
        code: 'PARSE',
        path: '',
        message,
      })),
    ];
    const report = this.validator.validate(normalized.data, sections, ctx, [
      ...parseIssues,
      ...normalized.warnings,
      ...this.packageRefIssues(normalized.data),
    ]);

    return {
      fileName: file.originalname,
      format: parser.format,
      normalized: normalized.data,
      report,
    };
  }

  async validate(examId: number, data: NormalizedExamImport): Promise<ImportValidationReport> {
    this.assertShape(data);
    const { sections, ctx } = await this.context(examId);
    return this.validator.validate(data, sections, ctx, this.packageRefIssues(data));
  }

  async save(examId: number, data: NormalizedExamImport): Promise<ExamImportSaveSummary> {
    this.assertShape(data);
    const { sections, ctx } = await this.context(examId);

    const report = this.validator.validate(data, sections, ctx, this.packageRefIssues(data));
    if (!report.canSave) {
      throw new BadRequestException({
        message: 'Dữ liệu import chưa hợp lệ — không thể lưu.',
        error: 'Bad Request',
        issues: report.issues.filter((i) => i.severity === 'error'),
        report,
      });
    }

    const importedByKey = new Map(
      data.sections.map((section) => [this.key(section.name), section]),
    );
    const summary: ExamImportSaveSummary = {
      sections: 0,
      groups: 0,
      materials: 0,
      questions: 0,
      options: 0,
    };

    const sortedSections = [...sections].sort((a, b) => a.position - b.position);
    for (const examSection of sortedSections) {
      const imported = importedByKey.get(this.key(examSection.name));
      if (!imported) continue;

      // Replace the section's content (questions/options/groups/materials cascade on delete).
      await this.questionRepo.deleteAllBySectionId(examSection.id!);
      await this.groupRepo.deleteAllBySectionId(examSection.id!);

      let groupPosition = 0;
      for (const group of imported.groups) {
        if (group.questions.length === 0 && group.materials.length === 0) continue;
        groupPosition += 1;
        const savedGroup = await this.groupRepo.save(
          ExamQuestionGroup.create({
            sectionId: examSection.id!,
            groupType: group.groupType as ExamGroupType,
            title: group.name,
            position: groupPosition,
          }),
        );

        let materialPosition = 0;
        for (const material of group.materials) {
          materialPosition += 1;
          await this.materialRepo.save(
            ExamGroupMaterial.create({
              groupId: savedGroup.id!,
              type: material.type,
              title: material.title,
              content: material.content,
              fileUrl: material.fileUrl,
              transcript: material.transcript,
              position: materialPosition,
            }),
          );
          summary.materials += 1;
        }

        const ordered = [...group.questions].sort((a, b) => a.position - b.position);
        let questionPosition = 0;
        for (const question of ordered) {
          questionPosition += 1;
          await this.saveQuestion(
            examSection.id!,
            savedGroup.id!,
            question,
            questionPosition,
            summary,
          );
        }
        summary.groups += 1;
      }

      const direct = [...imported.directQuestions].sort((a, b) => a.position - b.position);
      let directPosition = 0;
      for (const question of direct) {
        directPosition += 1;
        await this.saveQuestion(examSection.id!, null, question, directPosition, summary);
      }

      summary.sections += 1;
    }

    return summary;
  }

  /**
   * Downloadable template.
   * - `examId` → scaffold rows from the exam's parts (existing flow).
   * - `options.sections` → scaffold rows from a custom part list (template
   *   downloaded before the exam exists — the dialog lets Admin type the
   *   parts / question counts, or pick them from an exam format).
   * - neither → generic sample template.
   */
  async buildTemplate(
    examId?: number,
    options: { sections?: ExamTemplateSection[]; title?: string } = {},
  ): Promise<{ buffer: Buffer; fileName: string }> {
    if (!examId) {
      const sections = options.sections ?? [];
      const title = options.title?.trim() || undefined;
      if (sections.length === 0 && !title) {
        return {
          buffer: buildExamImportTemplateBuffer(),
          fileName: buildExamImportTemplateFileName(),
        };
      }
      return {
        buffer: buildExamImportTemplateBuffer({ title, sections }),
        fileName: buildExamImportTemplateFileName(title),
      };
    }

    const exam = await this.examRepo.findById(examId);
    if (!exam) throw new NotFoundException('Không tìm thấy đề thi.');

    const sections = [...(await this.sectionRepo.findByExamId(examId))].sort(
      (a, b) => a.position - b.position,
    );
    const buffer = buildExamImportTemplateBuffer({
      title: exam.title,
      sections: sections.map((s) => ({ name: s.name, questionCount: s.questionCount ?? 0 })),
    });
    return { buffer, fileName: buildExamImportTemplateFileName(exam.title) };
  }

  private async saveQuestion(
    sectionId: number,
    groupId: number | null,
    question: NormalizedQuestion,
    position: number,
    summary: ExamImportSaveSummary,
  ): Promise<void> {
    const saved = await this.questionRepo.save(
      ExamQuestion.create({
        sectionId,
        groupId,
        type: question.type,
        question: question.question,
        explanation: question.explanation,
        points: question.points,
        position,
      }),
    );

    const options = question.options
      .filter((o) => (o.content ?? '').trim() !== '')
      .sort((a, b) => a.position - b.position);

    if (options.length > 0) {
      await this.optionRepo.saveAll(
        options.map((option, index) =>
          ExamOption.create({
            questionId: saved.id!,
            content: option.content.trim(),
            isCorrect: option.isCorrect,
            position: index + 1,
          }),
        ),
      );
    }

    summary.questions += 1;
    summary.options += options.length;
  }

  /**
   * Exam + sections + mapping context — public so the ZIP package importer
   * runs the exact same pipeline on the exact same data.
   */
  async loadContext(examId: number): Promise<ImportBodyContext> {
    const exam = await this.examRepo.findById(examId);
    if (!exam) throw new NotFoundException('Không tìm thấy đề thi.');

    const sections = await this.sectionRepo.findByExamId(examId);

    let examTypeName: string | null = null;
    let examFormatName: string | null = null;
    const format = await this.formatRepo.findById(exam.examFormatId);
    if (format) {
      examFormatName = format.name;
      const examType = await this.typeRepo.findById(format.examTypeId);
      examTypeName = examType?.name ?? null;
    }

    return { exam, sections, ctx: { examTypeName, examFormatName } };
  }

  private async context(examId: number): Promise<ImportBodyContext> {
    return this.loadContext(examId);
  }

  /**
   * `package://` refs only exist inside the ZIP-package flow (resolved to real
   * storage URLs before save). If one leaks into the plain Excel flow there is
   * no file behind it — reject instead of persisting a broken URL.
   */
  private packageRefIssues(data: NormalizedExamImport): {
    severity: 'error';
    code: string;
    path: string;
    message: string;
  }[] {
    const issues: { severity: 'error'; code: string; path: string; message: string }[] = [];
    data.sections.forEach((section, si) => {
      section.groups.forEach((group, gi) => {
        group.materials.forEach((material, mi) => {
          if (material.fileUrl?.startsWith('package://')) {
            issues.push({
              severity: 'error',
              code: 'PACKAGE_REF_UNRESOLVED',
              path: `sections.${si}.groups.${gi}.materials.${mi}`,
              message:
                `Tài liệu "${material.title ?? `#${mi + 1}`}" trỏ tới file trong gói ZIP ` +
                `("${material.fileUrl.slice('package://'.length)}") — thao tác này chỉ hỗ trợ ` +
                'khi import dạng GÓI ZIP (ZIP import), không dùng được với file Excel đơn lẻ.',
            });
          }
        });
      });
    });
    return issues;
  }

  private assertShape(data: NormalizedExamImport): void {
    if (!data || !Array.isArray(data.sections)) {
      throw new BadRequestException('Payload import không hợp lệ (thiếu danh sách sections).');
    }
  }

  private key(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
  }
}
