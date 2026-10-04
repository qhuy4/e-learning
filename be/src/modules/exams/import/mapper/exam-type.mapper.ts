import { Inject, Injectable } from '@nestjs/common';
import type { ExamGroupType } from '../../domain/enums/exam-group-type.enum';
import type { QuestionType } from '../../domain/enums/question-type.enum';
import type { ExamImportContext } from '../exam-import.model';

export const EXAM_TYPE_MAPPERS = 'EXAM_TYPE_MAPPERS';

export interface ExamTypeMapperRuleContext extends ExamImportContext {
  sectionName: string;
  groupExists: boolean;
  templateGroupType: string | null;
  templateQuestionType: string | null;
}

export interface ExamTypeMapperPrefersContext extends ExamImportContext {
  sectionName: string;
}

/**
 * Exam-type specific mapping rules (TOEIC, IELTS, and future JLPT/HSK/TOPIK).
 *
 * The import core never hardcodes an exam type: adding a new exam type means
 * implementing this interface and registering the mapper in EXAM_TYPE_MAPPERS
 * (see exams-import.module.ts). No database or CRUD changes are required.
 *
 * Rules only FILL IN what the uploaded file leaves out — an explicit value in
 * the template always wins over a mapper inference.
 */
export interface ExamTypeMapper {
  /** Short key, e.g. "toeic". */
  readonly key: string;
  matches(examTypeName: string | null): boolean;
  /** Default group type when a section's groups omit group_type. */
  inferGroupType(ctx: ExamTypeMapperRuleContext): ExamGroupType | null;
  /** Default question type when a row omits question_type. */
  inferQuestionType(ctx: ExamTypeMapperRuleContext): QuestionType | null;
  /**
   * Structural rule: true = the section must hold grouped questions
   * (e.g. TOEIC Part 3), false = it must hold direct questions (Part 5),
   * null = no opinion.
   */
  prefersGrouped(ctx: ExamTypeMapperPrefersContext): boolean | null;
}

@Injectable()
export class ExamTypeMapperRegistry {
  private readonly mappers: ExamTypeMapper[];

  constructor(@Inject(EXAM_TYPE_MAPPERS) mappers: ExamTypeMapper[]) {
    this.mappers = mappers;
  }

  resolve(examTypeName: string | null): ExamTypeMapper | null {
    if (!examTypeName) return null;
    const lower = examTypeName.toLowerCase();
    return this.mappers.find((m) => m.matches(lower)) ?? null;
  }
}
