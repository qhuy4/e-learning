import { SkillCategory } from '../domain/enum/skill-category.enum';
import { SkillAssessmentStatus } from '../domain/enum/skill-assessment-status.enum';

export interface AssessmentPolicy {
  minIndependentEvidence: number;
  minEvidenceWeight: number;
  assessedConfidence: number;
}

/**
 * Business policy, not a trained model. Categories intentionally have
 * different evidence requirements: language/exam proficiency can be supported
 * by a verified assessment, while teaching competency needs independent
 * observations of teaching performance.
 */
export const ASSESSMENT_POLICY: Record<
  SkillCategory.LANGUAGE | SkillCategory.EXAM | SkillCategory.PEDAGOGY,
  AssessmentPolicy
> = {
  [SkillCategory.LANGUAGE]: {
    minIndependentEvidence: 1,
    minEvidenceWeight: 0.1,
    assessedConfidence: 0.55,
  },
  [SkillCategory.EXAM]: {
    minIndependentEvidence: 1,
    minEvidenceWeight: 0.1,
    assessedConfidence: 0.6,
  },
  [SkillCategory.PEDAGOGY]: {
    minIndependentEvidence: 1,
    minEvidenceWeight: 0.3,
    assessedConfidence: 0.6,
  },
};

export interface AssessmentStateInput {
  category: SkillCategory;
  eligibleEvidenceCount: number;
  independentEvidenceCount: number;
  effectiveWeight: number;
  confidence: number | null;
  verifiedRatio: number;
  canEstimate: boolean;
}

export function determineAssessmentStatus(
  input: AssessmentStateInput,
): SkillAssessmentStatus {
  if (input.eligibleEvidenceCount === 0) {
    return SkillAssessmentStatus.NO_EVIDENCE;
  }

  const policy =
    ASSESSMENT_POLICY[
      input.category as
        SkillCategory.LANGUAGE | SkillCategory.EXAM | SkillCategory.PEDAGOGY
    ];
  if (
    !policy ||
    !input.canEstimate ||
    input.independentEvidenceCount < policy.minIndependentEvidence ||
    input.effectiveWeight < policy.minEvidenceWeight
  ) {
    return SkillAssessmentStatus.INSUFFICIENT_EVIDENCE;
  }

  // Một điểm ngôn ngữ/kỳ thi lấy hoàn toàn từ chứng chỉ đã được admin duyệt
  // là kết quả trực tiếp, không cần nhiều nguồn như năng lực giảng dạy.
  if (
    (input.category === SkillCategory.LANGUAGE ||
      input.category === SkillCategory.EXAM) &&
    input.verifiedRatio >= 0.999
  ) {
    return SkillAssessmentStatus.ASSESSED;
  }

  return input.confidence != null &&
    input.confidence >= policy.assessedConfidence
    ? SkillAssessmentStatus.ASSESSED
    : SkillAssessmentStatus.PROVISIONAL;
}
