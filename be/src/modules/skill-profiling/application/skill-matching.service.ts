import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApprovalStatus } from '@/modules/instructors/domain/enum/instructor-profile.status';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { UserStatus } from '@/modules/users/domain/enum/user.status';
import { SkillSourceType } from '@/modules/skill-profiling/domain/enum/skill-source-type.enum';
import { SkillCategory } from '@/modules/skill-profiling/domain/enum/skill-category.enum';
import { SkillCatalogRepository } from '@/modules/skill-profiling/infrastructure/repository/skill-catalog.repository';
import {
  levelDistance,
  parseTeachingLevels,
} from '@/modules/student-assessment/domain/cefr';

/** Tùy chọn level — không truyền = hành vi v1 y hệt (không đụng level). */
export interface MatchOptions {
  /** Band CEFR của sinh viên (A1–C2). */
  studentLevel?: string | null;
  /**
   * Lọc trước khi xếp hạng: chỉ giữ giảng viên dạy EXACT level
   * + giảng viên CHƯA khai báo teaching_levels. Lệch ±1 (adjacent) bị loại
   * khỏi kết quả khi bật lọc.
   */
  requireLevelMatch?: boolean;
  /** ALL = không lọc; FREE = học phí 0; PAID = học phí > 0 và theo khoảng giá. */
  priceMode?: 'ALL' | 'FREE' | 'PAID';
  minHourlyRate?: number;
  maxHourlyRate?: number;
}

/**
 * Matching v1 — READ-ONLY: xếp hạng instructor theo danh sách skill mục tiêu.
 *
 * - fit         = weighted mean của score trên các skill ĐÃ có profile
 *                 (KHÔNG nhân confidence — confidence chỉ là tie-breaker).
 * - coverage    = tổng trọng số skill đã biết / tổng trọng số yêu cầu;
 *                 coverage = 0 → insufficient (không xếp hạng, KHÔNG gán 0).
 * - confidenceAvg = weighted mean confidence trên skill đã biết (Σw·c/Σw).
 * - eligibility = đúng 3 điều kiện repo đã có: approval_status = APPROVED,
 *                 users.role = INSTRUCTOR, users.status = ACTIVE.
 * - Không chạy aggregation, không gọi model, không đổi scoring formula.
 * - sources lấy từ evidence count query tổng hợp GROUP BY — chỉ những type
 *   thực sự tồn tại, không sinh nhãn nguồn giả.
 */
interface EligibleRow {
  id: string | number;
  user_id?: string | number;
  name: string;
  headline: string | null;
  total_students: number | string;
  avg_rating: number | string | null;
  teaching_levels?: string | string[] | null;
  hourly_rate: number | string;
}

interface ProfileRow {
  instructor_id: string | number;
  skill_id: string | number;
  score: number | string | null;
  confidence: number | string | null;
  assessment_status?: string;
  evidence_count: number;
  verified_ratio: number | string;
}

interface EvidenceCountRow {
  instructor_id: string | number;
  skill_id: string | number;
  source_type: SkillSourceType;
  cnt: number;
}

export interface TargetSkill {
  skillId: number;
  code: string;
  name: string;
  weight: number;
}

export interface MatchingMatchedSkill {
  skillId: number;
  name: string;
  score: number;
  confidence: number;
  /** Confidence-adjusted value used only for ranking; original score is kept. */
  adjustedScore: number;
  evidenceCount: number;
  /** Tỷ trọng số bằng chứng VERIFIED (0..1) — hiển thị, không nhân vào score. */
  verifiedRatio: number;
  sources: Array<{ type: SkillSourceType; count: number }>;
}

export interface MatchingResult {
  targets: Array<TargetSkill & { weight: number }>;
  ranked: Array<{
    instructor: {
      id: number;
      name: string;
      headline: string | null;
      totalStudents: number;
      avgRating: number | null;
      hourlyRate: number;
      /** Chỉ có khi match truyền studentLevel. null = chưa khai báo level. */
      teachesLevel?: boolean | null;
      /** 0 exact, 1 adjacent, >1 lệch xa, null = chưa khai báo. */
      levelDistance?: number | null;
    };
    fit: number;
    /** Điểm xếp hạng tổng thể; phần skill chưa có dữ liệu dùng baseline 0.5. */
    matchScore: number;
    coverage: number;
    confidenceAvg: number;
    matchedSkills: MatchingMatchedSkill[];
    unknownSkills: Array<{ skillId: number; name: string; status: 'unknown' }>;
    reasons: string[];
  }>;
  insufficient: Array<{
    instructor: { id: number; name: string; headline: string | null };
    status: 'insufficient_data';
    coverage: number;
  }>;
  meta: {
    eligible: number;
    rankedCount: number;
    insufficientCount: number;
    levelFilter?: {
      enabled: boolean;
      studentLevel: string;
      excludedCount: number;
    };
    priceFilter?: {
      mode: 'FREE' | 'PAID';
      minHourlyRate?: number;
      maxHourlyRate?: number;
      excludedCount: number;
    };
  };
}

@Injectable()
export class SkillMatchingService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly catalog: SkillCatalogRepository,
  ) {}

  /** Danh sách skill mục tiêu (read-only) — FE dùng để chọn target. */
  async getCatalog(): Promise<
    Array<{ id: number; code: string; name: string; category: string }>
  > {
    const rows: Array<{
      id: string | number;
      code: string;
      name: string;
      category: string;
    }> = await this.dataSource.query(
      `SELECT id, code, name, category FROM instructor_skills
       WHERE is_active = TRUE AND category = $1 ORDER BY display_order`,
      [SkillCategory.LANGUAGE],
    );
    return rows.map((r) => ({
      id: Number(r.id),
      code: r.code,
      name: r.name,
      category: r.category,
    }));
  }

  async match(
    dto: {
      targets: Array<{ skillId: number; weight?: number }>;
      limit?: number;
    },
    opts?: MatchOptions,
  ): Promise<MatchingResult> {
    const limit = dto.limit ?? 10;
    const studentLevel = opts?.studentLevel ?? null;
    const levelEnabled = Boolean(studentLevel);
    const priceMode = opts?.priceMode ?? 'ALL';
    if (
      priceMode === 'PAID' &&
      opts?.minHourlyRate != null &&
      opts?.maxHourlyRate != null &&
      opts.minHourlyRate > opts.maxHourlyRate
    ) {
      throw new BadRequestException(
        'Học phí tối thiểu không được lớn hơn học phí tối đa',
      );
    }

    // Dedupe: skillId lặp → weight cuối thắng (tránh double-count).
    const weightBySkill = new Map<number, number>();
    for (const t of dto.targets) {
      weightBySkill.set(t.skillId, t.weight ?? 1);
    }

    const targets: TargetSkill[] = [];
    for (const [skillId, weight] of weightBySkill) {
      const row = await this.catalog.findActiveById(skillId);
      if (!row) {
        throw new BadRequestException(
          `Skill ${skillId} không tồn tại hoặc không hoạt động`,
        );
      }
      if (row.category !== SkillCategory.LANGUAGE) {
        throw new BadRequestException(
          `Skill ${skillId} chưa được hỗ trợ cho matching giảng viên`,
        );
      }
      targets.push({ skillId, code: row.code, name: row.name, weight });
    }

    const totalWeight = targets.reduce((sum, t) => sum + t.weight, 0);
    if (totalWeight <= 0) {
      throw new BadRequestException('Tổng trọng số targets phải lớn hơn 0');
    }
    const skillIds = targets.map((t) => t.skillId);

    // Eligibility — reuse đúng rule hiện có, không thêm điều kiện mới.
    const allEligible: EligibleRow[] = await this.dataSource.query(
      `SELECT ip.id, ip.user_id, u.name, ip.headline, ip.total_students, ip.avg_rating,
              ip.teaching_levels, ip.hourly_rate
       FROM instructor_profiles ip
       JOIN users u ON u.id = ip.user_id
       WHERE ip.approval_status = $1 AND u.role = $2 AND u.status = $3
       ORDER BY ip.id`,
      [ApprovalStatus.APPROVED, UserRole.INSTRUCTOR, UserStatus.ACTIVE],
    );
    const eligible = allEligible.filter((row) => {
      const rate = Number(row.hourly_rate ?? 0);
      if (priceMode === 'FREE') return rate === 0;
      if (priceMode !== 'PAID' || rate <= 0) return priceMode === 'ALL';
      if (opts?.minHourlyRate != null && rate < opts.minHourlyRate)
        return false;
      if (opts?.maxHourlyRate != null && rate > opts.maxHourlyRate)
        return false;
      return true;
    });
    const excludedByPrice = allEligible.length - eligible.length;

    const empty: MatchingResult = {
      targets: this.normalizedTargets(targets, totalWeight),
      ranked: [],
      insufficient: [],
      meta: {
        eligible: eligible.length,
        rankedCount: 0,
        insufficientCount: 0,
        ...(priceMode !== 'ALL'
          ? {
              priceFilter: {
                mode: priceMode,
                ...(priceMode === 'PAID' && opts?.minHourlyRate != null
                  ? { minHourlyRate: opts.minHourlyRate }
                  : {}),
                ...(priceMode === 'PAID' && opts?.maxHourlyRate != null
                  ? { maxHourlyRate: opts.maxHourlyRate }
                  : {}),
                excludedCount: excludedByPrice,
              },
            }
          : {}),
      },
    };
    if (eligible.length === 0) return empty;

    const eligibleIds = eligible.map((e) => Number(e.id));
    const profiles: ProfileRow[] = await this.dataSource.query(
      `SELECT instructor_id, skill_id, score, confidence, evidence_count,
              verified_ratio, assessment_status
       FROM instructor_skill_profiles
       WHERE skill_id = ANY($1::bigint[]) AND instructor_id = ANY($2::bigint[])`,
      [skillIds, eligibleIds],
    );
    // Sources = evidence KHÔNG DECLARED — tự khai không tham gia tính điểm,
    // không được liệt kê như nguồn của score.
    const evidenceCounts: EvidenceCountRow[] = await this.dataSource.query(
      `SELECT instructor_id, skill_id, source_type, count(*)::int AS cnt
       FROM instructor_skill_evidences
       WHERE status = 'ACTIVE'
         AND verification <> 'DECLARED'
         AND skill_id = ANY($1::bigint[])
         AND instructor_id = ANY($2::bigint[])
       GROUP BY instructor_id, skill_id, source_type`,
      [skillIds, eligibleIds],
    );

    const profilesByInstructor = new Map<number, Map<number, ProfileRow>>();
    for (const p of profiles) {
      const iid = Number(p.instructor_id);
      const sid = Number(p.skill_id);
      const m = profilesByInstructor.get(iid) ?? new Map<number, ProfileRow>();
      m.set(sid, p);
      profilesByInstructor.set(iid, m);
    }

    const sourcesBy = new Map<string, MatchingMatchedSkill['sources']>();
    for (const row of evidenceCounts) {
      const key = `${Number(row.instructor_id)}|${Number(row.skill_id)}`;
      const list = sourcesBy.get(key) ?? [];
      list.push({ type: row.source_type, count: Number(row.cnt) });
      sourcesBy.set(key, list);
    }
    for (const list of sourcesBy.values()) {
      list.sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
    }

    const ranked: MatchingResult['ranked'] = [];
    const insufficient: MatchingResult['insufficient'] = [];

    for (const inst of eligible) {
      const iid = Number(inst.id);
      const publicInstructorId = Number(inst.user_id ?? inst.id);
      const rows = profilesByInstructor.get(iid);
      const matchedSkills: MatchingMatchedSkill[] = [];
      const unknownSkills: MatchingResult['ranked'][number]['unknownSkills'] =
        [];
      let sumW = 0;
      let scoreSum = 0;
      let confSum = 0;

      for (const t of targets) {
        const p = rows?.get(t.skillId);
        if (
          !p ||
          p.score == null ||
          p.confidence == null ||
          (p.assessment_status != null &&
            !['PROVISIONAL', 'ASSESSED'].includes(p.assessment_status))
        ) {
          // Thiếu profile → unknown, KHÔNG gán score 0.
          unknownSkills.push({
            skillId: t.skillId,
            name: t.name,
            status: 'unknown',
          });
          continue;
        }
        const score = Number(p.score);
        const confidence = Number(p.confidence);
        const adjustedScore = 0.5 + confidence * (score - 0.5);
        sumW += t.weight;
        scoreSum += t.weight * adjustedScore;
        confSum += t.weight * confidence;
        matchedSkills.push({
          skillId: t.skillId,
          name: t.name,
          score,
          confidence,
          adjustedScore,
          evidenceCount: Number(p.evidence_count),
          verifiedRatio: Number(p.verified_ratio ?? 0),
          sources:
            sourcesBy.get(`${iid}|${t.skillId}`) ??
            ([] as MatchingMatchedSkill['sources']),
        });
      }

      const coverage = sumW / totalWeight;

      if (sumW <= 0) {
        // coverage = 0 → insufficient, không xếp hạng.
        insufficient.push({
          instructor: {
            id: publicInstructorId,
            name: inst.name,
            headline: inst.headline,
          },
          status: 'insufficient_data',
          coverage: 0,
        });
        continue;
      }

      const fit = scoreSum / sumW;
      // Skill chưa có dữ liệu không phải 0 điểm, nhưng cũng không được bỏ qua
      // khỏi thứ hạng: dùng baseline trung lập giống confidence adjustment.
      const matchScore = (scoreSum + (totalWeight - sumW) * 0.5) / totalWeight;
      const confidenceAvg = confSum / sumW;
      const dist = levelEnabled
        ? levelDistance(parseTeachingLevels(inst.teaching_levels), studentLevel)
        : null;

      // Sort reasons theo đóng góp w·score (weight thô — hệ số chung không đổi thứ tự).
      const reasons = [...matchedSkills]
        .sort(
          (a, b) =>
            (weightBySkill.get(b.skillId) ?? 0) * b.adjustedScore -
            (weightBySkill.get(a.skillId) ?? 0) * a.adjustedScore,
        )
        .slice(0, 3)
        .map((m) => {
          const sourceTypes = m.sources.map((s) => s.type).join(', ');
          const verifiedTag =
            m.verifiedRatio >= 1
              ? '[Đã xác minh] '
              : m.verifiedRatio > 0
                ? `[Phần xác minh ${(m.verifiedRatio * 100).toFixed(0)}%] `
                : '[Suy luận] ';
          return (
            `${verifiedTag}${m.name}: score ${m.score.toFixed(2)}, confidence ${m.confidence.toFixed(2)}, ranking ${m.adjustedScore.toFixed(2)}` +
            ` từ ${m.evidenceCount} evidence` +
            (sourceTypes ? ` (${sourceTypes})` : '')
          );
        });
      if (coverage < 1) {
        reasons.push(
          `Độ phủ ${(coverage * 100).toFixed(0)}% — ${unknownSkills.length}/${targets.length} kỹ năng mục tiêu chưa có dữ liệu`,
        );
      }

      ranked.push({
        instructor: {
          id: publicInstructorId,
          name: inst.name,
          headline: inst.headline,
          totalStudents: Number(inst.total_students),
          avgRating: inst.avg_rating == null ? null : Number(inst.avg_rating),
          hourlyRate: Number(inst.hourly_rate ?? 0),
          ...(levelEnabled
            ? {
                teachesLevel: dist === null ? null : dist === 0,
                levelDistance: dist,
              }
            : {}),
        },
        fit,
        matchScore,
        coverage,
        confidenceAvg,
        matchedSkills,
        unknownSkills,
        reasons,
      });
    }

    // Pre-filter level (chỉ khi bật requireLevelMatch): giữ exact (0)
    // + CHƯA khai báo (null); loại adjacent (1) và lệch xa (>1).
    let excludedByLevel = 0;
    if (levelEnabled && opts?.requireLevelMatch) {
      const before = ranked.length;
      const filtered = ranked.filter(
        (r) =>
          r.instructor.levelDistance === null ||
          r.instructor.levelDistance === 0,
      );
      excludedByLevel = before - filtered.length;
      ranked.length = 0;
      ranked.push(...filtered);
    }

    // Khi bắt buộc đúng level: exact trước, chưa khai báo chỉ là fallback.
    // Sau đó matchScore (đã tính coverage) → fit → coverage → confidence → id.
    const levelAsc = (a: number | null, b: number | null): number => {
      if (a === b) return 0;
      if (a === null) return 1;
      if (b === null) return -1;
      return a - b;
    };
    ranked.sort(
      (a, b) =>
        (levelEnabled && opts?.requireLevelMatch
          ? levelAsc(
              a.instructor.levelDistance ?? null,
              b.instructor.levelDistance ?? null,
            )
          : 0) ||
        b.matchScore - a.matchScore ||
        b.fit - a.fit ||
        (!opts?.requireLevelMatch
          ? levelAsc(
              a.instructor.levelDistance ?? null,
              b.instructor.levelDistance ?? null,
            )
          : 0) ||
        b.coverage - a.coverage ||
        b.confidenceAvg - a.confidenceAvg ||
        a.instructor.id - b.instructor.id,
    );
    insufficient.sort((a, b) => a.instructor.id - b.instructor.id);

    return {
      targets: this.normalizedTargets(targets, totalWeight),
      ranked: ranked.slice(0, limit),
      insufficient: insufficient.slice(0, limit),
      meta: {
        eligible: eligible.length,
        rankedCount: ranked.length,
        insufficientCount: insufficient.length,
        ...(priceMode !== 'ALL'
          ? {
              priceFilter: {
                mode: priceMode,
                ...(priceMode === 'PAID' && opts?.minHourlyRate != null
                  ? { minHourlyRate: opts.minHourlyRate }
                  : {}),
                ...(priceMode === 'PAID' && opts?.maxHourlyRate != null
                  ? { maxHourlyRate: opts.maxHourlyRate }
                  : {}),
                excludedCount: excludedByPrice,
              },
            }
          : {}),
        ...(levelEnabled
          ? {
              levelFilter: {
                enabled: Boolean(opts?.requireLevelMatch),
                studentLevel: studentLevel as string,
                excludedCount: excludedByLevel,
              },
            }
          : {}),
      },
    };
  }

  private normalizedTargets(
    targets: TargetSkill[],
    totalWeight: number,
  ): MatchingResult['targets'] {
    return targets.map((t) => ({
      ...t,
      weight: t.weight / totalWeight,
    }));
  }
}
