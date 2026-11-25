import { SkillSourceType } from '../domain/enum/skill-source-type.enum';

/**
 * Single source of truth for the skill aggregation model.
 *
 * - `baseWeights` are snapshotted into `instructor_skill_evidences.weight`
 *   at write time (SkillEvidenceService); the aggregation reads the stored
 *   weight so a config edit never silently rewrites historical scores.
 * - Bump `modelVersion` whenever baseWeights (or the formula) change so
 *   profiles computed with the old weight set stay identifiable.
 * - Bump `extractorVersion` whenever evidence extraction changes.
 *
 * v3 scoring (evidence-only heuristic + verification tiers):
 *   - `weight` snapshot = baseWeight(source) × verificationWeight
 *     (VERIFIED 1.0, INFERRED 0.5, DECLARED 0 — DECLARED bị loại hoàn toàn).
 *   - `verified_ratio` = Σ w_i của VERIFIED / Σ w_i (hiển thị, không phải score).
 *   - Model blend đã bị loại khỏi runtime; `model_kind` luôn 'heuristic'.
 *
 * MVP scoring (evidence-only heuristic — features KHÔNG tham gia score):
 *   score    = Σ W_S·score_S / Σ W_S
 *   conf     = (1 − e^(−ΣW/nFactorDivisor))
 *            × consistency × attrFactor
 *            × (confidenceBase + (1−confidenceBase)·meanConf)
 *   - rawW_S = Σ weight_i × confidence_i × decay_i  (confidence đã nằm trong w —
 *     KHÔNG nhân confidence lần 2 vào score, tránh giảm weight lần thứ hai)
 *   - Correlated records collapse to one independence unit. Independent
 *     certificates or students may add weight and confidence.
 *   - R1: evidence chỉ gồm nguồn suy luận (EXPERIENCE...) → cap confidence CUỐI
 *     tại manualOnlyCap (score vẫn tính bình thường).
 *
 * §2 trong design (per-skill feature formulas) là ML FEATURE SPEC / model input,
 * KHÔNG phải heuristic formula — features chỉ dùng cho attrFactor (R3).
 * Model pipeline (SkillModelService + blend) đã xóa ở Phase 5.
 */
export const SKILL_AGGREGATION_CONFIG = {
  // This is a deterministic heuristic algorithm version, not a trained model.
  modelVersion: 'heuristic-mvp-v3',
  extractorVersion: 'mvp-v3',
  /** Evidence older than this is worth half as much. */
  halfLifeDays: 180,
  /** nFactor = 1 − exp(−ΣW / nFactorDivisor). */
  nFactorDivisor: 1,
  /** conf factor = confidenceBase + (1 − confidenceBase) × meanConf. */
  confidenceBase: 0.6,
  /** R1: cap final confidence when evidence is only self-report. */
  manualOnlyCap: 0.35,
  /** R3: SUBJECT skill with zero attributed content (feature row says 0/0). */
  subjectNoAttrFactor: 0.4,
  baseWeights: {
    [SkillSourceType.SELF_ASSESSMENT]: 0.15,
    [SkillSourceType.EXPERIENCE]: 0.25,
    [SkillSourceType.LESSON_PLAN]: 0.4,
    [SkillSourceType.CERTIFICATE]: 0.5,
    [SkillSourceType.STUDENT_RATING]: 0.85,
    [SkillSourceType.STUDENT_OUTCOME]: 1.0,
  } as Record<SkillSourceType, number>,
};
