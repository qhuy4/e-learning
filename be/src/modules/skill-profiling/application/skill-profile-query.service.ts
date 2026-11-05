import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { SkillSourceType } from '@/modules/skill-profiling/domain/enum/skill-source-type.enum';
import type {
  SkillCapability,
  SkillVerification,
} from '@/modules/skill-profiling/domain/enum/skill-verification.enum';
import { SkillAssessmentStatus } from '../domain/enum/skill-assessment-status.enum';

export interface EvidenceListOptions {
  skillId?: number;
  sourceType?: SkillSourceType;
  limit?: number;
}

interface EvidenceRow {
  id: string;
  skill_id: string;
  source_type: SkillSourceType;
  source_id: string | null;
  score: string;
  confidence: string;
  weight: string;
  observed_at: Date;
  extractor_version: string;
  verification: SkillVerification;
  capability: SkillCapability;
  metadata: {
    rationale?: string;
    extracted?: boolean;
    scale?: 'IELTS_BAND' | 'TOEIC_SECTION' | 'TOEIC_TOTAL';
    band?: number;
  } | null;
}

interface SkillRow {
  id: string | number;
  code: string;
  name: string;
  category: string;
  description: string | null;
  display_order?: number | string;
}

interface ProfileRow {
  skill_id: string | number;
  score: string | number | null;
  confidence: string | number | null;
  evidence_count: number;
  independent_evidence_count: number;
  assessment_status: SkillAssessmentStatus;
  current_run_id: string | number | null;
  verified_ratio: string | number;
  computed_at: Date;
}

const nullableNumber = (value: string | number | null): number | null =>
  value == null ? null : Number(value);

interface AggregateRow {
  source_type: SkillSourceType;
  cnt: number;
  avg_score: number;
  max_score: number;
}

interface CountRow {
  source_type: SkillSourceType;
  cnt: number;
}

interface ReviewSourceRow {
  id: string | number;
  rating: number | string;
  course_title: string;
}

interface LessonSourceRow {
  id: string | number;
  title: string;
  status: number;
  course_title: string;
}

interface CertSourceRow {
  id: string | number;
  certificate_name: string;
  issuer: string | null;
  certificate_status: number;
}

interface EnrollmentSourceRow {
  id: string | number;
  progress: number | null;
  course_title: string;
}

export interface SourceDisplay {
  type: SkillSourceType;
  label: string;
  title: string | null;
  subtitle: string | null;
  value: string | null;
}

const SOURCE_LABELS: Record<SkillSourceType, string> = {
  [SkillSourceType.SELF_ASSESSMENT]: 'Tự đánh giá',
  [SkillSourceType.EXPERIENCE]: 'Kinh nghiệm giảng dạy',
  [SkillSourceType.LESSON_PLAN]: 'Phân tích bài học',
  [SkillSourceType.CERTIFICATE]: 'Chứng chỉ',
  [SkillSourceType.STUDENT_RATING]: 'Đánh giá học viên',
  [SkillSourceType.STUDENT_OUTCOME]: 'Tiến độ học viên',
};

@Injectable()
export class SkillProfileQueryService {
  constructor(private readonly dataSource: DataSource) {}

  async resolveProfileId(userId: number): Promise<number> {
    const rows: Array<{ id: number | string }> = await this.dataSource.query(
      'SELECT id FROM instructor_profiles WHERE user_id = $1',
      [userId],
    );
    if (!rows[0]) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return Number(rows[0].id);
  }

  /** Dashboard + trang AI Skill Profile: mọi skill active, có profile thì kèm score. */
  async list(profileId: number) {
    const skills: SkillRow[] = await this.dataSource.query(
      `SELECT id, code, name, category, description, display_order
       FROM instructor_skills WHERE is_active = TRUE ORDER BY display_order`,
    );
    const profiles: ProfileRow[] = await this.dataSource.query(
      `SELECT skill_id, score, confidence, evidence_count,
              independent_evidence_count, assessment_status, current_run_id,
              verified_ratio, computed_at
       FROM instructor_skill_profiles WHERE instructor_id = $1`,
      [profileId],
    );
    const bySkill = new Map<string, ProfileRow>(
      profiles.map((p) => [String(p.skill_id), p] as [string, ProfileRow]),
    );

    return skills.map((s) => {
      const p = bySkill.get(String(s.id));
      return {
        id: Number(s.id),
        code: s.code,
        name: s.name,
        category: s.category,
        description: s.description,
        displayOrder: Number(s.display_order),
        score: p ? nullableNumber(p.score) : null,
        confidence: p ? nullableNumber(p.confidence) : null,
        assessmentStatus:
          p?.assessment_status ?? SkillAssessmentStatus.NO_EVIDENCE,
        evidenceCount: p ? Number(p.evidence_count) : 0,
        independentEvidenceCount: p ? Number(p.independent_evidence_count) : 0,
        verifiedRatio: p ? Number(p.verified_ratio) : 0,
        computedAt: p ? p.computed_at : null,
      };
    });
  }

  /** Chi tiết 1 skill: score + confidence + lý do (Why) + sample evidence. */
  async detail(profileId: number, skillId: number) {
    const skillRows: SkillRow[] = await this.dataSource.query(
      `SELECT id, code, name, category, description
       FROM instructor_skills WHERE id = $1 AND is_active = TRUE`,
      [skillId],
    );
    if (!skillRows[0]) {
      throw new AppException(ErrorCode.SKILL_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const profileRows: Array<Omit<ProfileRow, 'skill_id'>> =
      await this.dataSource.query(
        `SELECT score, confidence, evidence_count, independent_evidence_count,
                assessment_status, current_run_id, verified_ratio, computed_at
         FROM instructor_skill_profiles
         WHERE instructor_id = $1 AND skill_id = $2`,
        [profileId, skillId],
      );
    const profile = profileRows[0] ?? null;

    const aggregates: AggregateRow[] = await this.dataSource.query(
      `SELECT source_type,
              count(*)::int AS cnt,
              avg(score)::float AS avg_score,
              max(score)::float AS max_score
       FROM instructor_skill_evidences
       WHERE instructor_id = $1 AND skill_id = $2 AND status = 'ACTIVE'
         AND verification <> 'DECLARED'
       GROUP BY source_type`,
      [profileId, skillId],
    );

    const sampleRows: EvidenceRow[] = await this.dataSource.query(
      `SELECT id, skill_id, source_type, source_id, score, confidence, weight,
              observed_at, extractor_version, verification, capability, metadata
       FROM instructor_skill_evidences
       WHERE instructor_id = $1 AND skill_id = $2 AND status = 'ACTIVE'
       ORDER BY observed_at DESC
       LIMIT 30`,
      [profileId, skillId],
    );

    const evidence = await this.enrich(sampleRows);
    const reasons = this.buildReasons(aggregates);
    const assessmentEvidence = profile?.current_run_id
      ? await this.dataSource.query(
          `SELECT evidence_id AS "evidenceId", source_type AS "sourceType",
                  source_id AS "sourceId", independence_key AS "independenceKey",
                  eligible, exclusion_reason AS "exclusionReason",
                  normalized_score AS "normalizedScore",
                  effective_weight AS "effectiveWeight", contribution
           FROM skill_assessment_evidence_snapshots
           WHERE run_id = $1 AND skill_id = $2 ORDER BY id`,
          [profile.current_run_id, skillId],
        )
      : [];

    return {
      skill: {
        id: Number(skillRows[0].id),
        code: skillRows[0].code,
        name: skillRows[0].name,
        category: skillRows[0].category,
        description: skillRows[0].description,
      },
      score: profile ? nullableNumber(profile.score) : null,
      confidence: profile ? nullableNumber(profile.confidence) : null,
      assessmentStatus:
        profile?.assessment_status ?? SkillAssessmentStatus.NO_EVIDENCE,
      evidenceCount: profile ? Number(profile.evidence_count) : 0,
      independentEvidenceCount: profile
        ? Number(profile.independent_evidence_count)
        : 0,
      currentRunId: profile?.current_run_id
        ? Number(profile.current_run_id)
        : null,
      verifiedRatio: profile ? Number(profile.verified_ratio) : 0,
      computedAt: profile ? profile.computed_at : null,
      reasons,
      evidence,
      assessmentEvidence,
    };
  }

  async history(profileId: number, skillId: number) {
    return this.dataSource.query(
      `SELECT r.id AS "runId", r.trigger_type AS "triggerType",
              r.processing_status AS "processingStatus",
              r.algorithm_version AS "algorithmVersion",
              r.input_hash AS "inputHash", r.started_at AS "startedAt",
              r.completed_at AS "completedAt", r.error,
              sr.score, sr.confidence,
              sr.assessment_status AS "assessmentStatus",
              sr.evidence_count AS "evidenceCount",
              sr.independent_evidence_count AS "independentEvidenceCount",
              sr.explanation
       FROM skill_assessment_runs r
       LEFT JOIN skill_assessment_results sr
         ON sr.run_id = r.id AND sr.skill_id = $2
       WHERE r.instructor_id = $1
       ORDER BY r.id DESC LIMIT 30`,
      [profileId, skillId],
    );
  }

  /** Trang Evidence: danh sách bằng chứng (lọc theo skill/nguồn) + tổng theo nguồn. */
  async evidenceList(profileId: number, options: EvidenceListOptions) {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
    const params: unknown[] = [profileId];
    let where = `e.instructor_id = $1 AND e.status = 'ACTIVE'`;
    if (options.skillId != null) {
      params.push(options.skillId);
      where += ` AND e.skill_id = $${params.length}`;
    }
    if (options.sourceType) {
      params.push(options.sourceType);
      where += ` AND e.source_type = $${params.length}`;
    }

    const rows: Array<
      EvidenceRow & { skill_code: string; skill_name: string }
    > = await this.dataSource.query(
      `SELECT e.id, e.skill_id, e.source_type, e.source_id, e.score, e.confidence,
                e.weight, e.observed_at, e.extractor_version, e.verification,
                e.capability, e.metadata,
                s.code AS skill_code, s.name AS skill_name
         FROM instructor_skill_evidences e
         JOIN instructor_skills s ON s.id = e.skill_id
         WHERE ${where}
         ORDER BY e.observed_at DESC
         LIMIT ${limit}`,
      params,
    );

    const countRows: CountRow[] = await this.dataSource.query(
      `SELECT source_type,
              count(DISTINCT COALESCE(source_id, 'row:' || id::text))::int AS cnt
       FROM instructor_skill_evidences
       WHERE instructor_id = $1 AND status = 'ACTIVE'
       GROUP BY source_type`,
      [profileId],
    );
    const counts = Object.fromEntries(
      countRows.map((r) => [r.source_type, Number(r.cnt)]),
    );

    const items = (await this.enrich(rows)).map((row, i) => ({
      ...row,
      skillId: Number(rows[i].skill_id),
      skillCode: rows[i].skill_code ?? null,
      skillName: rows[i].skill_name ?? null,
    }));

    return { items, counts };
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  private async enrich(rows: EvidenceRow[]): Promise<
    Array<{
      id: number;
      sourceType: SkillSourceType;
      sourceLabel: string;
      score: number;
      confidence: number;
      weight: number;
      observedAt: Date;
      verification: SkillVerification;
      capability: SkillCapability;
      rationale: string | null;
      extracted: boolean;
      source: SourceDisplay | null;
    }>
  > {
    const reviewIds: number[] = [];
    const lessonIds: number[] = [];
    const certIds: number[] = [];
    const enrollmentIds: number[] = [];
    for (const r of rows) {
      if (!r.source_id) continue;
      const id = Number(r.source_id);
      if (!Number.isFinite(id)) continue;
      switch (r.source_type) {
        case SkillSourceType.STUDENT_RATING:
          reviewIds.push(id);
          break;
        case SkillSourceType.LESSON_PLAN:
          lessonIds.push(id);
          break;
        case SkillSourceType.CERTIFICATE:
          certIds.push(id);
          break;
        case SkillSourceType.STUDENT_OUTCOME:
          enrollmentIds.push(id);
          break;
      }
    }

    const [reviews, lessons, certs, enrollments] = await Promise.all([
      reviewIds.length
        ? this.dataSource.query<ReviewSourceRow[]>(
            `SELECT r.id, r.rating, c.title AS course_title
             FROM reviews r JOIN courses c ON c.id = r.course_id
             WHERE r.id = ANY($1::bigint[])`,
            [reviewIds],
          )
        : Promise.resolve([] as ReviewSourceRow[]),
      lessonIds.length
        ? this.dataSource.query<LessonSourceRow[]>(
            `SELECT l.id, l.title, l.status, c.title AS course_title
             FROM lessons l
             JOIN sections s ON s.id = l.section_id
             JOIN courses c ON c.id = s.course_id
             WHERE l.id = ANY($1::bigint[])`,
            [lessonIds],
          )
        : Promise.resolve([] as LessonSourceRow[]),
      certIds.length
        ? this.dataSource.query<CertSourceRow[]>(
            `SELECT id, certificate_name, issuer, certificate_status
             FROM instructor_certificates WHERE id = ANY($1::bigint[])`,
            [certIds],
          )
        : Promise.resolve([] as CertSourceRow[]),
      enrollmentIds.length
        ? this.dataSource.query<EnrollmentSourceRow[]>(
            `SELECT e.id, e.progress, c.title AS course_title
             FROM enrollments e JOIN courses c ON c.id = e.course_id
             WHERE e.id = ANY($1::bigint[])`,
            [enrollmentIds],
          )
        : Promise.resolve([] as EnrollmentSourceRow[]),
    ]);

    const reviewMap = new Map<string, ReviewSourceRow>(
      reviews.map((r) => [String(r.id), r] as [string, ReviewSourceRow]),
    );
    const lessonMap = new Map<string, LessonSourceRow>(
      lessons.map((r) => [String(r.id), r] as [string, LessonSourceRow]),
    );
    const certMap = new Map<string, CertSourceRow>(
      certs.map((r) => [String(r.id), r] as [string, CertSourceRow]),
    );
    const enrollmentMap = new Map<string, EnrollmentSourceRow>(
      enrollments.map(
        (r) => [String(r.id), r] as [string, EnrollmentSourceRow],
      ),
    );

    return rows.map((r) => ({
      id: Number(r.id),
      sourceType: r.source_type,
      sourceLabel: SOURCE_LABELS[r.source_type] ?? r.source_type,
      score: Number(r.score),
      confidence: Number(r.confidence),
      weight: Number(r.weight),
      observedAt: r.observed_at,
      verification: r.verification,
      capability: r.capability,
      rationale: r.metadata?.rationale ?? null,
      extracted: r.metadata?.extracted === true,
      source: this.sourceDisplay(r, {
        reviewMap,
        lessonMap,
        certMap,
        enrollmentMap,
      }),
    }));
  }

  private sourceDisplay(
    r: EvidenceRow,
    maps: {
      reviewMap: Map<string, ReviewSourceRow>;
      lessonMap: Map<string, LessonSourceRow>;
      certMap: Map<string, CertSourceRow>;
      enrollmentMap: Map<string, EnrollmentSourceRow>;
    },
  ): SourceDisplay | null {
    if (!r.source_id) {
      return {
        type: r.source_type,
        label: SOURCE_LABELS[r.source_type] ?? r.source_type,
        title: null,
        subtitle: null,
        value: null,
      };
    }
    switch (r.source_type) {
      case SkillSourceType.STUDENT_RATING: {
        const row = maps.reviewMap.get(r.source_id);
        if (!row) return null;
        return {
          type: r.source_type,
          label: SOURCE_LABELS[r.source_type],
          title: row.course_title,
          subtitle: null,
          value: `${row.rating}/5`,
        };
      }
      case SkillSourceType.LESSON_PLAN: {
        const row = maps.lessonMap.get(r.source_id);
        if (!row) return null;
        return {
          type: r.source_type,
          label: SOURCE_LABELS[r.source_type],
          title: row.title,
          subtitle: row.course_title,
          value: Number(row.status) === 1 ? 'Đã xuất bản' : 'Bản nháp',
        };
      }
      case SkillSourceType.CERTIFICATE: {
        const row = maps.certMap.get(r.source_id);
        if (!row) return null;
        const maxByScale = {
          IELTS_BAND: 9,
          TOEIC_SECTION: 495,
          TOEIC_TOTAL: 990,
        } as const;
        const scale = r.metadata?.scale;
        const rawValue =
          scale && r.metadata?.band != null
            ? `${r.metadata.band}/${maxByScale[scale]}`
            : null;
        return {
          type: r.source_type,
          label: SOURCE_LABELS[r.source_type],
          title: row.certificate_name,
          subtitle: row.issuer,
          value:
            rawValue ??
            (Number(row.certificate_status) === 2
              ? 'Đã xác minh'
              : 'Chờ duyệt'),
        };
      }
      case SkillSourceType.STUDENT_OUTCOME: {
        const row = maps.enrollmentMap.get(r.source_id);
        if (!row) return null;
        return {
          type: r.source_type,
          label: SOURCE_LABELS[r.source_type],
          title: row.course_title,
          subtitle: null,
          value: `${Number(row.progress ?? 0)}%`,
        };
      }
      default:
        return {
          type: r.source_type,
          label: SOURCE_LABELS[r.source_type] ?? r.source_type,
          title: null,
          subtitle: null,
          value: null,
        };
    }
  }

  private buildReasons(
    aggregates: Array<{
      source_type: SkillSourceType;
      cnt: number;
      avg_score: number;
      max_score: number;
    }>,
  ): string[] {
    const byType = new Map(aggregates.map((a) => [a.source_type as string, a]));
    const reasons: string[] = [];

    const exp = byType.get(SkillSourceType.EXPERIENCE);
    if (exp) {
      const years = Math.round(exp.max_score * 5);
      reasons.push(
        `[Suy luận] Kinh nghiệm giảng dạy khoảng ${years} năm với kỹ năng này`,
      );
    }
    const rating = byType.get(SkillSourceType.STUDENT_RATING);
    if (rating) {
      reasons.push(
        `[Suy luận] Đánh giá trung bình ${(rating.avg_score * 5).toFixed(1)}/5 từ ${rating.cnt} đánh giá học viên`,
      );
    }
    const cert = byType.get(SkillSourceType.CERTIFICATE);
    if (cert) {
      reasons.push(`[Đã xác minh] Có ${cert.cnt} chứng chỉ được xác minh`);
    }
    const outcome = byType.get(SkillSourceType.STUDENT_OUTCOME);
    if (outcome) {
      reasons.push(
        `[Suy luận] ${outcome.cnt} học viên, tiến độ trung bình ${Math.round(outcome.avg_score * 100)}%`,
      );
    }
    const lesson = byType.get(SkillSourceType.LESSON_PLAN);
    if (lesson) {
      reasons.push(`[Suy luận] ${lesson.cnt} bài học đã được phân tích`);
    }

    // SELF_ASSESSMENT là DECLARED — không tham gia score nên không nằm trong
    // phần giải thích điểm. Không có bằng chứng tính điểm => nói rõ chưa đủ.
    if (reasons.length === 0) {
      reasons.push(
        '[Chưa đủ dữ liệu] Chưa có bằng chứng nào được xác minh hoặc suy luận',
      );
    }

    return reasons;
  }
}
