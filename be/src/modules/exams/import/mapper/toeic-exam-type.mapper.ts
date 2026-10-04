import { Injectable } from '@nestjs/common';
import { ExamGroupType } from '../../domain/enums/exam-group-type.enum';
import type { QuestionType } from '../../domain/enums/question-type.enum';
import type {
  ExamTypeMapper,
  ExamTypeMapperPrefersContext,
  ExamTypeMapperRuleContext,
} from './exam-type.mapper';

/**
 * TOEIC mapping rules:
 *   Part 1-4 -> grouped questions with AUDIO material
 *   Part 5   -> direct questions
 *   Part 6-7 -> grouped questions with PASSAGE material
 */
@Injectable()
export class ToeicExamTypeMapper implements ExamTypeMapper {
  readonly key = 'toeic';

  matches(examTypeName: string): boolean {
    return examTypeName.includes('toeic');
  }

  inferGroupType(ctx: ExamTypeMapperRuleContext): ExamGroupType | null {
    if (!ctx.groupExists) return null;
    const section = ctx.sectionName.toLowerCase().replace(/\s+/g, '');
    if (/^part[1-4]/.test(section)) return ExamGroupType.AUDIO;
    if (/^part[67]/.test(section)) return ExamGroupType.PASSAGE;
    return null;
  }

  inferQuestionType(): QuestionType | null {
    return null;
  }

  prefersGrouped(ctx: ExamTypeMapperPrefersContext): boolean | null {
    const section = ctx.sectionName.toLowerCase().replace(/\s+/g, '');
    if (/^part[1-4]/.test(section)) return true;
    if (/^part[67]/.test(section)) return true;
    if (/^part[5]/.test(section)) return false;
    return null;
  }
}
