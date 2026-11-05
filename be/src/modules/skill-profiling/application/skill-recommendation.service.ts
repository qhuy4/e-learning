import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SkillSourceType } from '../domain/enum/skill-source-type.enum';

const STRENGTH_MIN_SCORE = 0.65;
const STRENGTH_MIN_CONFIDENCE = 0.6;

const ACTION_LABELS: Record<string, string> = {
  ADD_CERTIFICATE: 'Thêm chứng chỉ đã xác minh có kết quả phù hợp',
  ADD_STUDENT_REVIEW: 'Thu thập phản hồi học viên có cấu trúc',
  ADD_STUDENT_PROGRESS: 'Thu thập kết quả tiến bộ của học viên',
  ADD_TEACHING_OBSERVATION: 'Bổ sung quan sát hoạt động giảng dạy',
  ADD_AI_ASSESSMENT: 'Hoàn thành bài đánh giá năng lực ngôn ngữ',
};

@Injectable()
export class SkillRecommendationService {
  constructor(private readonly dataSource: DataSource) {}

  async get(profileId: number) {
    const skills: Array<{
      id: string | number;
      code: string;
      name: string;
      category: string;
    }> = await this.dataSource.query(
      `SELECT id, code, name, category FROM instructor_skills
       WHERE is_active = TRUE ORDER BY display_order`,
    );
    const profiles: Array<{
      skill_id: string | number;
      score: number | string | null;
      confidence: number | string | null;
      evidence_count: number;
      assessment_status: string;
    }> = await this.dataSource.query(
      `SELECT skill_id, score, confidence, evidence_count, assessment_status
       FROM instructor_skill_profiles WHERE instructor_id = $1`,
      [profileId],
    );
    const evidenceCounts: Array<{
      skill_id: string | number;
      source_type: SkillSourceType;
    }> = await this.dataSource.query(
      `SELECT skill_id, source_type
       FROM instructor_skill_evidences
       WHERE instructor_id = $1 AND status = 'ACTIVE'
         AND verification <> 'DECLARED'
       GROUP BY skill_id, source_type`,
      [profileId],
    );

    const profileBySkill = new Map(
      profiles.map((profile) => [String(profile.skill_id), profile]),
    );
    const typesBySkill = new Map<string, Set<SkillSourceType>>();
    for (const row of evidenceCounts) {
      const key = String(row.skill_id);
      const types = typesBySkill.get(key) ?? new Set<SkillSourceType>();
      types.add(row.source_type);
      typesBySkill.set(key, types);
    }

    const entries = skills.map((skill) => {
      const profile = profileBySkill.get(String(skill.id));
      return {
        skill: {
          id: Number(skill.id),
          code: skill.code,
          name: skill.name,
          category: skill.category,
        },
        score: profile?.score == null ? null : Number(profile.score),
        confidence:
          profile?.confidence == null ? null : Number(profile.confidence),
        assessmentStatus: profile?.assessment_status ?? 'NO_EVIDENCE',
        evidenceCount: Number(profile?.evidence_count ?? 0),
        presentTypes: typesBySkill.get(String(skill.id)) ?? new Set(),
      };
    });

    const strengths = entries
      .filter(
        (entry) =>
          entry.assessmentStatus === 'ASSESSED' &&
          entry.score != null &&
          entry.confidence != null &&
          entry.score >= STRENGTH_MIN_SCORE &&
          entry.confidence >= STRENGTH_MIN_CONFIDENCE,
      )
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 4)
      .map(({ presentTypes: _presentTypes, ...entry }) => entry);

    const limited = entries
      .filter((entry) => entry.assessmentStatus !== 'ASSESSED')
      .map((entry) => {
        const actionTypes: string[] = [];
        if (entry.skill.category === 'PEDAGOGY') {
          if (!entry.presentTypes.has(SkillSourceType.STUDENT_RATING))
            actionTypes.push('ADD_STUDENT_REVIEW');
          if (!entry.presentTypes.has(SkillSourceType.STUDENT_OUTCOME))
            actionTypes.push('ADD_STUDENT_PROGRESS');
          if (!entry.presentTypes.has(SkillSourceType.LESSON_PLAN))
            actionTypes.push('ADD_TEACHING_OBSERVATION');
        } else {
          if (!entry.presentTypes.has(SkillSourceType.CERTIFICATE))
            actionTypes.push('ADD_CERTIFICATE');
          actionTypes.push('ADD_AI_ASSESSMENT');
          if (entry.skill.category === 'EXAM')
            actionTypes.push('ADD_TEACHING_OBSERVATION');
        }
        const { presentTypes: _presentTypes, ...result } = entry;
        return {
          ...result,
          reason:
            entry.assessmentStatus === 'NO_EVIDENCE'
              ? 'Không có bằng chứng đủ điều kiện'
              : entry.assessmentStatus === 'INSUFFICIENT_EVIDENCE'
                ? 'Bằng chứng chưa đạt policy của nhóm năng lực'
                : 'Điểm còn tạm thời vì confidence chưa đạt ngưỡng',
          actions: actionTypes.slice(0, 3).map((type) => ({
            type,
            label: ACTION_LABELS[type],
          })),
        };
      });

    const stored: Array<{
      id: string | number;
      skill_id: string | number;
      recommendation_type: string;
      status: 'ACTIVE' | 'COMPLETED' | 'DISMISSED';
    }> = await this.dataSource.query(
      `SELECT id, skill_id, recommendation_type, status
       FROM skill_recommendations
       WHERE instructor_id = $1 AND status IN ('ACTIVE', 'DISMISSED')`,
      [profileId],
    );
    const storedByGap = new Map(
      stored.map((row) => [`${row.skill_id}:${row.recommendation_type}`, row]),
    );
    const lifecycleLimited = limited.map((entry) => ({
      ...entry,
      actions: entry.actions.map((action) => {
        const row = storedByGap.get(`${entry.skill.id}:${action.type}`);
        return {
          ...action,
          recommendationId: row ? Number(row.id) : null,
          status: row?.status ?? ('ACTIVE' as const),
        };
      }),
    }));

    return { strengths, limited: lifecycleLimited };
  }

  async reconcile(profileId: number, runId: number): Promise<void> {
    const recommendations = await this.get(profileId);
    const desired = new Map<
      string,
      { skillId: number; type: string; reason: string }
    >();
    for (const entry of recommendations.limited) {
      for (const action of entry.actions) {
        if (action.status === 'DISMISSED') continue;
        desired.set(`${entry.skill.id}:${action.type}`, {
          skillId: entry.skill.id,
          type: action.type,
          reason: entry.reason,
        });
      }
    }

    await this.dataSource.transaction(async (manager) => {
      const active: Array<{
        id: string | number;
        skill_id: string | number;
        recommendation_type: string;
      }> = await manager.query(
        `SELECT id, skill_id, recommendation_type FROM skill_recommendations
         WHERE instructor_id = $1 AND status = 'ACTIVE' FOR UPDATE`,
        [profileId],
      );
      for (const row of active) {
        if (desired.has(`${row.skill_id}:${row.recommendation_type}`)) continue;
        await manager.query(
          `UPDATE skill_recommendations
           SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [row.id],
        );
      }
      for (const gap of desired.values()) {
        await manager.query(
          `INSERT INTO skill_recommendations
             (instructor_id, skill_id, recommendation_type, status,
              rationale, created_by_run_id)
           VALUES ($1,$2,$3,'ACTIVE',$4,$5)
           ON CONFLICT DO NOTHING`,
          [profileId, gap.skillId, gap.type, gap.reason, runId],
        );
      }
    });
  }

  async dismiss(profileId: number, recommendationId: number): Promise<boolean> {
    const rows: unknown[] = await this.dataSource.query(
      `UPDATE skill_recommendations
       SET status = 'DISMISSED', dismissed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND instructor_id = $2 AND status = 'ACTIVE'
       RETURNING id`,
      [recommendationId, profileId],
    );
    return rows.length > 0;
  }
}
