import { SkillCategory } from '../domain/enum/skill-category.enum';
import { SkillAssessmentStatus } from '../domain/enum/skill-assessment-status.enum';
import { determineAssessmentStatus } from './skill-assessment.policy';

describe('determineAssessmentStatus', () => {
  it('keeps no evidence distinct from poor competency', () => {
    expect(
      determineAssessmentStatus({
        category: SkillCategory.LANGUAGE,
        eligibleEvidenceCount: 0,
        independentEvidenceCount: 0,
        effectiveWeight: 0,
        confidence: null,
        verifiedRatio: 0,
        canEstimate: false,
      }),
    ).toBe(SkillAssessmentStatus.NO_EVIDENCE);
  });

  it('allows one eligible teaching review as provisional evidence', () => {
    expect(
      determineAssessmentStatus({
        category: SkillCategory.PEDAGOGY,
        eligibleEvidenceCount: 1,
        independentEvidenceCount: 1,
        effectiveWeight: 0.4,
        confidence: 0.2,
        verifiedRatio: 0,
        canEstimate: true,
      }),
    ).toBe(SkillAssessmentStatus.PROVISIONAL);
  });

  it('allows a language estimate but labels low confidence provisional', () => {
    expect(
      determineAssessmentStatus({
        category: SkillCategory.LANGUAGE,
        eligibleEvidenceCount: 1,
        independentEvidenceCount: 1,
        effectiveWeight: 0.5,
        confidence: 0.4,
        verifiedRatio: 0,
        canEstimate: true,
      }),
    ).toBe(SkillAssessmentStatus.PROVISIONAL);
  });

  it('assesses only after the category confidence threshold', () => {
    expect(
      determineAssessmentStatus({
        category: SkillCategory.EXAM,
        eligibleEvidenceCount: 1,
        independentEvidenceCount: 1,
        effectiveWeight: 0.5,
        confidence: 0.6,
        verifiedRatio: 0,
        canEstimate: true,
      }),
    ).toBe(SkillAssessmentStatus.ASSESSED);
  });

  it('confirms a language score taken directly from an approved certificate', () => {
    expect(
      determineAssessmentStatus({
        category: SkillCategory.LANGUAGE,
        eligibleEvidenceCount: 1,
        independentEvidenceCount: 1,
        effectiveWeight: 0.45,
        confidence: 0.35,
        verifiedRatio: 1,
        canEstimate: true,
      }),
    ).toBe(SkillAssessmentStatus.ASSESSED);
  });

  it('keeps an inferred IELTS criterion provisional', () => {
    expect(
      determineAssessmentStatus({
        category: SkillCategory.LANGUAGE,
        eligibleEvidenceCount: 1,
        independentEvidenceCount: 1,
        effectiveWeight: 0.1,
        confidence: 0.11,
        verifiedRatio: 0,
        canEstimate: true,
      }),
    ).toBe(SkillAssessmentStatus.PROVISIONAL);
  });
});
