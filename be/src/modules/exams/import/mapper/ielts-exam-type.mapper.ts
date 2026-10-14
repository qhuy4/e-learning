import { Injectable } from '@nestjs/common';
import { ExamGroupType } from '../../domain/enums/exam-group-type.enum';
import { QuestionType } from '../../domain/enums/question-type.enum';
import type {
  ExamTypeMapper,
  ExamTypeMapperPrefersContext,
  ExamTypeMapperRuleContext,
} from './exam-type.mapper';

/**
 * IELTS mapping rules:
 *   Reading   -> grouped questions with PASSAGE material
 *   Listening -> grouped questions with AUDIO material
 *   Writing   -> direct ESSAY questions
 *   Speaking  -> direct questions
 */
@Injectable()
export class IeltsExamTypeMapper implements ExamTypeMapper {
  readonly key = 'ielts';

  matches(examTypeName: string): boolean {
    return examTypeName.includes('ielts');
  }

  inferGroupType(ctx: ExamTypeMapperRuleContext): ExamGroupType | null {
    if (!ctx.groupExists) return null;
    const section = this.normalize(ctx.sectionName);
    if (section.includes('reading') || section.includes('doc')) return ExamGroupType.PASSAGE;
    if (section.includes('listening') || section.includes('nghe')) return ExamGroupType.AUDIO;
    return null;
  }

  inferQuestionType(ctx: ExamTypeMapperRuleContext): QuestionType | null {
    const section = this.normalize(ctx.sectionName);
    if (section.includes('writing') || section.includes('viet')) return QuestionType.ESSAY;
    return null;
  }

  prefersGrouped(ctx: ExamTypeMapperPrefersContext): boolean | null {
    const section = this.normalize(ctx.sectionName);
    if (section.includes('reading') || section.includes('doc')) return true;
    if (section.includes('listening') || section.includes('nghe')) return true;
    if (section.includes('writing') || section.includes('viet')) return false;
    if (section.includes('speaking') || section.includes('noi')) return false;
    return null;
  }

  private normalize(sectionName: string): string {
    return sectionName
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
