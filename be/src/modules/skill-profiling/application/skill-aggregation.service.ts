import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createHash } from 'crypto';
import { InstructorSkillProfileOrmEntity } from '@/modules/skill-profiling/infrastructure/entity/instructor-skill-profile.orm-entity';
import { InstructorSkillEvidenceOrmEntity } from '@/modules/skill-profiling/infrastructure/entity/instructor-skill-evidence.orm-entity';
import { SkillEvidenceStatus } from '@/modules/skill-profiling/domain/enum/skill-evidence-status.enum';
import { SkillSourceType } from '@/modules/skill-profiling/domain/enum/skill-source-type.enum';
import { SkillCategory } from '@/modules/skill-profiling/domain/enum/skill-category.enum';
import { SkillVerification } from '@/modules/skill-profiling/domain/enum/skill-verification.enum';
import { SKILL_AGGREGATION_CONFIG } from './skill-aggregation.config';
import { SkillAssessmentStatus } from '../domain/enum/skill-assessment-status.enum';
import { determineAssessmentStatus } from './skill-assessment.policy';

export interface AggregatedSkillScore {
  skill_id: number;
  score: number | null;
  confidence: number | null;
  evidence_count: number;
  independent_evidence_count: number;
  verified_ratio: number;
  assessment_status: SkillAssessmentStatus;
}

export interface TopInstructorSkillScore {
  instructor_id: number;
  score: number;
  confidence: number;
  evidence_count: number;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

@Injectable()
export class SkillAggregationService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Recompute profile scores for one instructor from ACTIVE evidence only.
   *
   * - Runs in a transaction under a per-instructor advisory lock so two
   *   concurrent recomputes (or a recompute racing a supersede) serialize.
   * - Idempotent: same evidence => identical profile values, re-running
   *   never duplicates rows (unique instructor+skill) and never mutates
   *   evidence (read-only w.r.t. the audit trail).
   * - Skills whose evidence disappeared get their profile row deleted, so
   *   "no ACTIVE evidence" stays "no row" (unknown, not 0).
   */
  async recompute(
    instructorId: number,
    runId?: number,
  ): Promise<AggregatedSkillScore[]> {
    return this.dataSource.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock($1)', [instructorId]);

      if (runId != null) {
        const newer: Array<{ id: string | number }> = await manager.query(
          `SELECT id FROM skill_assessment_runs
           WHERE instructor_id = $1 AND id > $2
           ORDER BY id DESC LIMIT 1`,
          [instructorId, runId],
        );
        if (newer.length > 0) {
          await manager.query(
            `UPDATE skill_assessment_runs
             SET processing_status = 'SUPERSEDED', completed_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND processing_status = 'PROCESSING'`,
            [runId],
          );
          return [];
        }
      }

      const evidence = await manager.find(InstructorSkillEvidenceOrmEntity, {
        where: {
          instructor_id: instructorId,
          status: SkillEvidenceStatus.ACTIVE,
        },
      });
      const mvpEvidence = evidence.filter(
        (row) =>
          row.source_type === SkillSourceType.CERTIFICATE ||
          row.source_type === SkillSourceType.STUDENT_RATING ||
          row.source_type === SkillSourceType.STUDENT_OUTCOME,
      );
      const existingProfiles = await manager.find(
        InstructorSkillProfileOrmEntity,
        {
          where: { instructor_id: instructorId },
        },
      );

      // attrFactor (R3) cần category/code.
      const skillRows: Array<{ id: number; code: string; category: string }> =
        await manager.query(
          `SELECT id, code, category FROM instructor_skills WHERE is_active = TRUE`,
        );
      const skillMetaById = new Map<number, { code: string; category: string }>(
        skillRows.map((r) => [
          Number(r.id),
          { code: r.code, category: r.category },
        ]),
      );

      const bySkill = new Map<number, InstructorSkillEvidenceOrmEntity[]>();
      for (const ev of mvpEvidence) {
        // Dữ liệu tự khai không tham gia tính điểm (DECLARED = hiển thị only).
        if (ev.verification === SkillVerification.DECLARED) continue;
        // bigint columns come back from TypeORM as string — normalize,
        // otherwise Map lookups against numeric skill ids silently miss.
        const sid = Number(ev.skill_id);
        const list = bySkill.get(sid) ?? [];
        list.push(ev);
        bySkill.set(sid, list);
      }

      const results: AggregatedSkillScore[] = [];

      for (const [skillId, evs] of bySkill) {
        const meta = skillMetaById.get(skillId);
        const attrFactor = this.attrFactorFor(meta?.category, null);
        const agg = this.computeScore(evs, attrFactor);
        const category = meta?.category as SkillCategory | undefined;
        const assessmentStatus = category
          ? determineAssessmentStatus({
              category,
              eligibleEvidenceCount: agg.evidence_count,
              independentEvidenceCount: agg.independent_evidence_count,
              effectiveWeight: agg.effective_weight,
              confidence: agg.confidence,
              verifiedRatio: agg.verified_ratio,
              canEstimate: agg.effective_weight > 0,
            })
          : SkillAssessmentStatus.INSUFFICIENT_EVIDENCE;
        const visibleScore =
          assessmentStatus === SkillAssessmentStatus.INSUFFICIENT_EVIDENCE
            ? null
            : agg.score;

        const profile = existingProfiles.find(
          (p) => Number(p.skill_id) === skillId,
        );

        if (profile) {
          profile.score = visibleScore;
          profile.confidence = agg.confidence;
          profile.evidence_count = agg.evidence_count;
          profile.independent_evidence_count = agg.independent_evidence_count;
          profile.assessment_status = assessmentStatus;
          profile.current_run_id = runId ?? profile.current_run_id ?? null;
          profile.verified_ratio = agg.verified_ratio;
          profile.model_version = SKILL_AGGREGATION_CONFIG.modelVersion;
          profile.model_kind = 'heuristic';
          profile.score_model = null;
          profile.computed_at = new Date();
          await manager.save(profile);
        } else {
          await manager.save(
            manager.create(InstructorSkillProfileOrmEntity, {
              instructor_id: instructorId,
              skill_id: skillId,
              score: visibleScore,
              confidence: agg.confidence,
              evidence_count: agg.evidence_count,
              independent_evidence_count: agg.independent_evidence_count,
              assessment_status: assessmentStatus,
              current_run_id: runId ?? null,
              verified_ratio: agg.verified_ratio,
              model_version: SKILL_AGGREGATION_CONFIG.modelVersion,
              model_kind: 'heuristic',
              score_model: null,
              computed_at: new Date(),
            }),
          );
        }

        results.push({
          skill_id: skillId,
          score: visibleScore,
          confidence: agg.confidence,
          evidence_count: agg.evidence_count,
          independent_evidence_count: agg.independent_evidence_count,
          verified_ratio: agg.verified_ratio,
          assessment_status: assessmentStatus,
        });

        if (runId != null) {
          await this.persistRunSkill(
            manager,
            runId,
            skillId,
            results[results.length - 1],
          );
        }
      }

      // Drop stale profiles: skills that no longer have any ACTIVE evidence.
      const computedSkillIds = new Set(bySkill.keys());
      for (const stale of existingProfiles) {
        if (!computedSkillIds.has(Number(stale.skill_id))) {
          await manager.delete(InstructorSkillProfileOrmEntity, {
            id: stale.id,
          });
        }
      }

      if (runId != null) {
        for (const skill of skillRows) {
          const skillId = Number(skill.id);
          if (computedSkillIds.has(skillId)) continue;
          await manager.query(
            `INSERT INTO skill_assessment_results
               (run_id, skill_id, score, confidence, assessment_status,
                evidence_count, independent_evidence_count, verified_ratio, explanation)
             VALUES ($1, $2, NULL, NULL, 'NO_EVIDENCE', 0, 0, 0, $3)
             ON CONFLICT (run_id, skill_id) DO NOTHING`,
            [runId, skillId, { reason: 'No eligible evidence' }],
          );
        }
        const inputHash = createHash('sha256')
          .update(
            mvpEvidence
              .map(
                (row) =>
                  `${row.id}:${row.metadata?.content_hash ?? ''}:${row.status}`,
              )
              .sort()
              .join('|'),
          )
          .digest('hex');
        await manager.query(
          `UPDATE skill_assessment_runs
           SET processing_status = 'SUCCEEDED', input_hash = $2,
               completed_at = CURRENT_TIMESTAMP
           WHERE id = $1 AND processing_status = 'PROCESSING'`,
          [runId, inputHash],
        );
      }

      return results;
    });
  }

  private async persistRunSkill(
    manager: {
      query: (sql: string, params?: unknown[]) => Promise<unknown>;
    },
    runId: number,
    skillId: number,
    result: AggregatedSkillScore,
  ): Promise<void> {
    await manager.query(
      `INSERT INTO skill_assessment_results
         (run_id, skill_id, score, confidence, assessment_status,
          evidence_count, independent_evidence_count, verified_ratio, explanation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (run_id, skill_id) DO NOTHING`,
      [
        runId,
        skillId,
        result.score,
        result.confidence,
        result.assessment_status,
        result.evidence_count,
        result.independent_evidence_count,
        result.verified_ratio,
        {
          algorithm: SKILL_AGGREGATION_CONFIG.modelVersion,
          kind: 'deterministic_heuristic',
          independentEvidenceCount: result.independent_evidence_count,
        },
      ],
    );
  }

  async topInstructorsForSkill(
    skillId: number,
    limit: number,
    minConfidence: number,
  ): Promise<TopInstructorSkillScore[]> {
    const rows: Array<{
      instructor_id: string | number;
      score: string;
      confidence: string;
      evidence_count: number;
    }> = await this.dataSource.query(
      `SELECT instructor_id, score, confidence, evidence_count
       FROM instructor_skill_profiles
       WHERE skill_id = $1 AND score IS NOT NULL AND confidence >= $2
         AND assessment_status IN ('PROVISIONAL', 'ASSESSED')
       ORDER BY score DESC, confidence DESC, instructor_id ASC
       LIMIT $3`,
      [skillId, minConfidence, limit],
    );
    return rows.map((r) => ({
      instructor_id: Number(r.instructor_id),
      score: Number(r.score),
      confidence: Number(r.confidence),
      evidence_count: r.evidence_count,
    }));
  }

  /**
   * attrFactor — mức phủ attribution của skill này với nội dung giảng viên.
   *
   * - PEDAGOGY: luôn 1 (theo định nghĩa áp cho toàn bộ catalog).
   * - SUBJECT: feature row đã tồn tại mà n_courses=0 && n_lessons=0 →
   *   subjectNoAttrFactor (R3: keyword-miss, scope rỗng).
   */
  private attrFactorFor(
    category: string | undefined,
    features: unknown,
  ): number {
    if (category !== SkillCategory.SUBJECT) return 1;
    if (features == null) {
      // Missing feature row means unknown, not no attribution.
      // Do not penalize confidence because refresh may not have run yet.
      return 1;
    }
    let parsed: unknown = features;
    if (typeof features === 'string') {
      try {
        parsed = JSON.parse(features);
      } catch {
        return 1;
      }
    }
    const f = parsed as { n_courses?: unknown; n_lessons?: unknown } | null;
    const nCourses = Number(f?.n_courses ?? 0);
    const nLessons = Number(f?.n_lessons ?? 0);
    return nCourses > 0 || nLessons > 0
      ? 1
      : SKILL_AGGREGATION_CONFIG.subjectNoAttrFactor;
  }

  /**
   * Pure aggregation — no I/O, fully unit-testable (v3, evidence-only).
   *
   * Dữ liệu DECLARED (tự khai) đã bị loại trước khi vào đây. Trọng số
   * VERIFIED/INFERRED được snapshot vào `weight` lúc ghi evidence.
   *
   * Per source type S (confidence đã nằm trong w_i — KHÔNG nhân lại vào score):
   *   rawW_S     = Σ weight_i × confidence_i × decay_i
   *   score_S    = Σ w_i·s_i / rawW_S
   *   conf_S     = Σ w_i·conf_i / rawW_S            — weighted mean confidence
   *
   *   totalWeight = Σ rawW_S after correlated records collapse to one unit
   *   verified_ratio = Σ_{VERIFIED} w_i / Σ w_i
   *   meanConf    = Σ(rawW_S × conf_S) / totalWeight
   *
   *   consistency = 1 − 4 × weightedVariance(unit scores)
   *   conf = (1 − e^(−totalWeight/nFactorDivisor)) × consistency
   *        × attrFactor × (confidenceBase + (1−confidenceBase)·meanConf)
   *   score = Σ rawW_S·score_S / totalWeight
   */
  private computeScore(
    evidences: InstructorSkillEvidenceOrmEntity[],
    attrFactor: number,
  ): Omit<AggregatedSkillScore, 'skill_id' | 'assessment_status'> & {
    effective_weight: number;
  } {
    const config = SKILL_AGGREGATION_CONFIG;
    const nowMs = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    interface SourceGroup {
      rawW: number;
      weightedScore: number;
      weightedConf: number;
    }
    const independentGroups = new Map<
      string,
      SourceGroup & { sourceType: SkillSourceType; maxSingleWeight: number }
    >();
    let verifiedWeight = 0;
    let allWeight = 0;

    const orderedEvidence = [...evidences].sort((a, b) => {
      const key = (ev: InstructorSkillEvidenceOrmEntity) =>
        typeof ev.metadata?.independence_key === 'string'
          ? ev.metadata.independence_key
          : `${ev.source_type}:${ev.source_id ?? `row:${ev.id}`}`;
      return (
        key(a).localeCompare(key(b)) || String(a.id).localeCompare(String(b.id))
      );
    });

    for (const ev of orderedEvidence) {
      // numeric columns come back from pg as strings — coerce before math
      const evScore = Number(ev.score);
      const evConfidence = Number(ev.confidence);
      const evWeight = Number(ev.weight);
      const ageDays = Math.max(0, (nowMs - ev.observed_at.getTime()) / dayMs);
      const decay = 0.5 ** (ageDays / config.halfLifeDays);
      const w = evWeight * evConfidence * decay;
      allWeight += w;
      if (ev.verification === SkillVerification.VERIFIED) {
        verifiedWeight += w;
      }

      const independenceKey =
        typeof ev.metadata?.independence_key === 'string'
          ? ev.metadata.independence_key
          : `${ev.source_type}:${ev.source_id ?? `row:${ev.id}`}`;
      const g = independentGroups.get(independenceKey) ?? {
        rawW: 0,
        weightedScore: 0,
        weightedConf: 0,
        sourceType: ev.source_type,
        maxSingleWeight: 0,
      };
      g.rawW += w;
      g.weightedScore += w * evScore;
      g.weightedConf += w * evConfidence;
      g.maxSingleWeight = Math.max(g.maxSingleWeight, w);
      independentGroups.set(independenceKey, g);
    }

    const independentUnits = [...independentGroups.values()].filter(
      (independent) => independent.rawW > 0,
    );
    const groups = new Map<SkillSourceType, SourceGroup>();
    for (const independent of independentUnits) {
      if (independent.rawW <= 0) continue;
      // Correlated observations (for example reviews from one course) form one
      // evidence unit. They may improve consistency, but not quantity weight.
      const unitWeight = independent.maxSingleWeight;
      const group = groups.get(independent.sourceType) ?? {
        rawW: 0,
        weightedScore: 0,
        weightedConf: 0,
      };
      group.rawW += unitWeight;
      group.weightedScore +=
        unitWeight * (independent.weightedScore / independent.rawW);
      group.weightedConf +=
        unitWeight * (independent.weightedConf / independent.rawW);
      groups.set(independent.sourceType, group);
    }

    let totalWeight = 0;
    let scoreNumerator = 0;
    let confWeightedSum = 0;

    for (const g of groups.values()) {
      if (g.rawW <= 0) continue; // mọi evidence conf=0 → nguồn không đóng góp
      // Independence is already bounded above: correlated records collapse to
      // one unit. Genuine independent students/certificates may add weight.
      const cappedW = g.rawW;
      totalWeight += cappedW;
      scoreNumerator += cappedW * (g.weightedScore / g.rawW);
      confWeightedSum += cappedW * (g.weightedConf / g.rawW);
    }

    const meanConf = totalWeight > 0 ? confWeightedSum / totalWeight : 0;
    const nFactor = 1 - Math.exp(-totalWeight / config.nFactorDivisor);
    const meanScore = totalWeight > 0 ? scoreNumerator / totalWeight : 0;
    const variance =
      totalWeight > 0
        ? independentUnits.reduce((sum, unit) => {
            const unitScore = unit.weightedScore / unit.rawW;
            return sum + unit.maxSingleWeight * (unitScore - meanScore) ** 2;
          }, 0) / totalWeight
        : 0;
    const consistency = clamp01(1 - 4 * variance);
    const confEvidence =
      config.confidenceBase + (1 - config.confidenceBase) * meanConf;

    let confidence = clamp01(nFactor * consistency * attrFactor * confEvidence);

    // R1 — cap final confidence only; evidence vẫn tham gia tính score.
    const onlySelfReport = [...groups.keys()].every(
      (t) =>
        t === SkillSourceType.SELF_ASSESSMENT ||
        t === SkillSourceType.EXPERIENCE,
    );
    if (onlySelfReport) {
      confidence = Math.min(confidence, config.manualOnlyCap);
    }

    const raw = totalWeight > 0 ? scoreNumerator / totalWeight : 0;

    return {
      score: clamp01(raw),
      confidence,
      evidence_count: evidences.length,
      independent_evidence_count: independentGroups.size,
      verified_ratio: allWeight > 0 ? clamp01(verifiedWeight / allWeight) : 0,
      effective_weight: totalWeight,
    };
  }
}
