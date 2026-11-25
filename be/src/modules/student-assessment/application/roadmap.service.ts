import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { LearnerProfileService } from './learner-profile.service';
import {
  CEFR_LEVELS,
  CefrBand,
  cefrIndex,
  isCefrBand,
} from '@/modules/student-assessment/domain/cefr';
import { CourseStatus } from '@/modules/courses/domain/enum/course-status.enum';
import { SkillAssessmentRunService } from '@/modules/skill-profiling/application/skill-assessment-run.service';

interface RoadmapCourseRow {
  id: string | number;
  instructor_id: string | number;
  cefr_level_start: string;
  cefr_level_end: string;
  skill_codes: string[];
  price: string | number;
}

interface RoadmapReadRow {
  id: string | number;
  current_level: string;
  target_level: string;
  status: string;
  revision: number;
  profile_snapshot: Record<string, unknown>;
  created_at: Date | string;
  stage_id: string | number | null;
  position: number | null;
  from_level: string | null;
  to_level: string | null;
  stage_status: string | null;
  rationale: Record<string, unknown> | null;
  started_at: Date | string | null;
  completed_at: Date | string | null;
  course_id: string | number | null;
  course_title: string | null;
  course_slug: string | null;
  course_price: string | number | null;
  instructor_id: string | number | null;
  instructor_name: string | null;
}

export function roadmapTransitions(
  current: CefrBand,
  target: CefrBand = 'B2',
): Array<{ from: CefrBand; to: CefrBand }> {
  const start = cefrIndex(current);
  const end = cefrIndex(target);
  if (start >= end) return [];
  return CEFR_LEVELS.slice(start, end).map((from, index) => ({
    from,
    to: CEFR_LEVELS[start + index + 1],
  }));
}

export type RoadmapReassessmentState =
  'LOCKED_STAGE' | 'NEEDS_ASSESSMENT' | 'READY';

export function roadmapReassessmentState(
  hasCompletedStage: boolean,
  hasFreshAssessment: boolean,
): RoadmapReassessmentState {
  if (!hasCompletedStage) return 'LOCKED_STAGE';
  return hasFreshAssessment ? 'READY' : 'NEEDS_ASSESSMENT';
}

@Injectable()
export class RoadmapService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly profiles: LearnerProfileService,
    private readonly assessmentRuns: SkillAssessmentRunService,
  ) {}

  async generate(userId: number) {
    const profile = await this.profiles.getProfile(userId);
    const currentLevel = this.currentLevel(profile);
    if (!currentLevel) {
      throw new BadRequestException(
        'Cần hoàn thành đánh giá trình độ trước khi tạo lộ trình.',
      );
    }
    if (cefrIndex(currentLevel) >= cefrIndex('B2')) {
      throw new BadRequestException('Bạn đã đạt mục tiêu B2 của lộ trình.');
    }

    const focusSkills = this.focusSkills(profile);
    const transitions = roadmapTransitions(currentLevel);

    return this.dataSource.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock($1)', [userId]);
      // TypeORM/Postgres trả [rows, affectedCount] cho UPDATE ... RETURNING.
      const [oldRows]: [{ revision: number }[], number] = await manager.query(
        `UPDATE learning_roadmaps SET status = 'SUPERSEDED', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 AND status = 'ACTIVE' RETURNING revision`,
        [userId],
      );
      const revision =
        Math.max(0, ...oldRows.map((row) => Number(row.revision))) + 1;
      const roadmapRows: Array<{ id: string | number }> = await manager.query(
        `INSERT INTO learning_roadmaps (
           user_id, current_level, target_level, revision, profile_snapshot
         ) VALUES ($1,$2,'B2',$3,$4::jsonb) RETURNING id`,
        [
          userId,
          currentLevel,
          revision,
          JSON.stringify({ focusSkills, levelSource: profile.levelSource }),
        ],
      );
      const roadmapId = Number(roadmapRows[0].id);
      const courses = await this.availableCourses(manager);
      const used = new Set<number>();

      for (const [index, transition] of transitions.entries()) {
        const course = this.pickCourse(courses, transition, focusSkills, used);
        if (course) used.add(Number(course.id));
        await this.insertStage(
          manager,
          roadmapId,
          index + 1,
          transition,
          course,
          focusSkills,
        );
      }
      return this.read(manager, userId);
    });
  }

  current(userId: number) {
    return this.read(this.dataSource.manager, userId);
  }

  async reassess(userId: number) {
    const result = await this.dataSource.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock($1)', [userId]);
      const roadmaps: Array<{
        id: string | number;
        current_level: string;
        revision: number;
        profile_snapshot: { levelSource?: string | null } | null;
      }> = await manager.query(
        `SELECT id, current_level, revision, profile_snapshot FROM learning_roadmaps
         WHERE user_id = $1 AND status = 'ACTIVE' FOR UPDATE`,
        [userId],
      );
      if (!roadmaps[0])
        throw new NotFoundException('Chưa có lộ trình để đánh giá lại.');

      const roadmap = roadmaps[0];
      const reassessmentState = await this.getReassessmentState(
        manager,
        Number(roadmap.id),
        userId,
      );
      if (reassessmentState === 'LOCKED_STAGE') {
        throw new BadRequestException(
          'Cần hoàn thành một chặng mới trước khi reassessment.',
        );
      }
      if (reassessmentState === 'NEEDS_ASSESSMENT') {
        throw new BadRequestException(
          'Cần hoàn thành một bài đánh giá mới sau chặng vừa học.',
        );
      }

      // Đọc profile sau eligibility check để assessment vừa mở khóa roadmap
      // cũng chính là dữ liệu được dùng cho quyết định điều chỉnh.
      const profile = await this.profiles.getProfile(userId);
      const assessedLevel = this.currentLevel(profile);
      if (!assessedLevel) {
        throw new BadRequestException('Chưa có kết quả reassessment hợp lệ.');
      }
      const focusSkills = this.focusSkills(profile);
      const preserved: Array<{
        course_id: string | number | null;
        to_level: string;
      }> = await manager.query(
        `SELECT course_id, to_level FROM learning_roadmap_stages
         WHERE roadmap_id = $1 AND status IN ('COMPLETED','IN_PROGRESS')`,
        [roadmap.id],
      );
      const positions: Array<{ max_position: number }> = await manager.query(
        `SELECT COALESCE(MAX(position), 0)::int AS max_position
         FROM learning_roadmap_stages WHERE roadmap_id = $1`,
        [roadmap.id],
      );
      // Cùng shape [rows, affectedCount] như trên.
      const [skippedRows]: [{ id: string | number }[], number] =
        await manager.query(
          `UPDATE learning_roadmap_stages
           SET status = 'SKIPPED', updated_at = CURRENT_TIMESTAMP
           WHERE roadmap_id = $1 AND status = 'PENDING' RETURNING id`,
          [roadmap.id],
        );

      // Nếu kết quả thấp hơn chặng đã học, tạo lại các chặng bổ trợ từ mức
      // vừa đánh giá; các chặng COMPLETED vẫn được giữ làm lịch sử.
      const transitions = roadmapTransitions(assessedLevel);
      const courses = await this.availableCourses(manager);
      const used = new Set(
        preserved
          .filter((stage) => stage.course_id != null)
          .map((stage) => Number(stage.course_id)),
      );
      let position = positions[0].max_position;
      for (const transition of transitions) {
        const course = this.pickCourse(courses, transition, focusSkills, used);
        if (course) used.add(Number(course.id));
        position += 1;
        await this.insertStage(
          manager,
          Number(roadmap.id),
          position,
          transition,
          course,
          focusSkills,
        );
      }

      const snapshot = { focusSkills, levelSource: profile.levelSource };
      await manager.query(
        `UPDATE learning_roadmaps
         SET current_level = $2, revision = revision + 1,
             profile_snapshot = $3::jsonb, status = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [
          roadmap.id,
          assessedLevel,
          JSON.stringify(snapshot),
          transitions.length ? 'ACTIVE' : 'COMPLETED',
        ],
      );
      await manager.query(
        `INSERT INTO roadmap_reassessments (
           roadmap_id, user_id, previous_level, assessed_level,
           profile_snapshot, decision
         ) VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)`,
        [
          roadmap.id,
          userId,
          roadmap.current_level,
          assessedLevel,
          JSON.stringify(snapshot),
          JSON.stringify({
            preservedStages: preserved.length,
            skippedStages: skippedRows.length,
            generatedStages: transitions.length,
            adaptiveStart: assessedLevel,
            previousLevelSource: roadmap.profile_snapshot?.levelSource ?? null,
            assessedLevelSource: profile.levelSource,
          }),
        ],
      );
      return this.read(manager, userId);
    });

    if (result) {
      await this.refreshOutcomeInstructor(result.id, userId);
    }
    return result;
  }

  private async refreshOutcomeInstructor(roadmapId: number, userId: number) {
    const rows: Array<{ instructor_id: string | number }> =
      await this.dataSource.query(
        `SELECT stage.instructor_id
         FROM roadmap_reassessments rr
         JOIN LATERAL (
           SELECT s.instructor_id
           FROM learning_roadmap_stages s
           WHERE s.roadmap_id = rr.roadmap_id
             AND s.status = 'COMPLETED'
             AND s.completed_at IS NOT NULL
             AND s.completed_at < rr.created_at
           ORDER BY s.completed_at DESC, s.id DESC
           LIMIT 1
         ) stage ON TRUE
         WHERE rr.roadmap_id = $1 AND rr.user_id = $2
         ORDER BY rr.created_at DESC, rr.id DESC
         LIMIT 1`,
        [roadmapId, userId],
      );
    const instructorUserId = Number(rows[0]?.instructor_id);
    if (Number.isFinite(instructorUserId) && instructorUserId !== userId) {
      await this.assessmentRuns.onEvidenceChangedForUser(instructorUserId);
    }
  }

  private currentLevel(
    profile: Awaited<ReturnType<LearnerProfileService['getProfile']>>,
  ): CefrBand | null {
    const selfBand = profile.selfAssessment?.band;
    return isCefrBand(profile.levelBand)
      ? profile.levelBand
      : selfBand === 'pre-A1'
        ? 'A1'
        : isCefrBand(selfBand)
          ? selfBand
          : null;
  }

  private focusSkills(
    profile: Awaited<ReturnType<LearnerProfileService['getProfile']>>,
  ) {
    return profile.skills
      .filter((skill) => skill.status === 'assessed')
      .map((skill) => ({
        code: skill.code,
        score: skill.scorePct ?? skill.qualityScore ?? 100,
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((skill) => skill.code);
  }

  private availableCourses(
    manager: EntityManager,
  ): Promise<RoadmapCourseRow[]> {
    return manager.query(
      `SELECT id, instructor_id, cefr_level_start, cefr_level_end,
              skill_codes, price
       FROM courses
       WHERE status = $1 AND deleted_at IS NULL
         AND cefr_level_start IS NOT NULL AND cefr_level_end IS NOT NULL
         AND jsonb_array_length(skill_codes) > 0`,
      [CourseStatus.PUBLISHED],
    );
  }

  private pickCourse(
    courses: RoadmapCourseRow[],
    transition: { from: CefrBand; to: CefrBand },
    focusSkills: string[],
    used: Set<number>,
  ) {
    return courses
      .filter(
        (course) =>
          !used.has(Number(course.id)) &&
          // A course at the destination level serves the transition into that
          // level. For example, A1 → A2 should select an A2 course instead of
          // requiring one course to span both A1 and A2.
          cefrIndex(course.cefr_level_start) <= cefrIndex(transition.to) &&
          cefrIndex(course.cefr_level_end) >= cefrIndex(transition.to),
      )
      .sort((a, b) => {
        const overlap = (course: RoadmapCourseRow) =>
          course.skill_codes.filter((code) => focusSkills.includes(code))
            .length;
        return overlap(b) - overlap(a) || Number(a.price) - Number(b.price);
      })[0];
  }

  private insertStage(
    manager: EntityManager,
    roadmapId: number,
    position: number,
    transition: { from: CefrBand; to: CefrBand },
    course: RoadmapCourseRow | undefined,
    focusSkills: string[],
  ) {
    return manager.query(
      `INSERT INTO learning_roadmap_stages (
         roadmap_id, position, from_level, to_level, course_id,
         instructor_id, rationale
       ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
      [
        roadmapId,
        position,
        transition.from,
        transition.to,
        course ? Number(course.id) : null,
        course ? Number(course.instructor_id) : null,
        JSON.stringify({
          focusSkills,
          matchedSkills: course
            ? course.skill_codes.filter((code) => focusSkills.includes(code))
            : [],
        }),
      ],
    );
  }

  private async read(manager: EntityManager, userId: number) {
    const rows: RoadmapReadRow[] = await manager.query(
      `SELECT r.id, r.current_level, r.target_level, r.status, r.revision,
              r.profile_snapshot, r.created_at,
              s.id AS stage_id, s.position, s.from_level, s.to_level,
              s.status AS stage_status, s.rationale, s.started_at,
              s.completed_at,
              c.id AS course_id, c.title AS course_title, c.slug AS course_slug,
              c.price AS course_price, u.id AS instructor_id,
              u.name AS instructor_name
       FROM learning_roadmaps r
       LEFT JOIN learning_roadmap_stages s ON s.roadmap_id = r.id
       LEFT JOIN courses c ON c.id = s.course_id
       LEFT JOIN users u ON u.id = s.instructor_id
       WHERE r.id = (
         SELECT selected.id FROM learning_roadmaps selected
         WHERE selected.user_id = $1
           AND selected.status IN ('ACTIVE','COMPLETED')
         ORDER BY CASE WHEN selected.status = 'ACTIVE' THEN 0 ELSE 1 END,
                  selected.updated_at DESC
         LIMIT 1
       )
       ORDER BY s.position`,
      [userId],
    );
    if (!rows[0]) return null;
    const reassessmentState =
      rows[0].status === 'COMPLETED'
        ? 'LOCKED_STAGE'
        : await this.getReassessmentState(manager, Number(rows[0].id), userId);
    const reassessments: Array<{
      previous_level: string;
      assessed_level: string;
      decision: {
        preservedStages?: number;
        skippedStages?: number;
        generatedStages?: number;
      };
      created_at: Date | string;
    }> = await manager.query(
      `SELECT previous_level, assessed_level, decision, created_at
       FROM roadmap_reassessments
       WHERE roadmap_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [rows[0].id],
    );
    const latest = reassessments[0];
    return {
      id: Number(rows[0].id),
      currentLevel: rows[0].current_level,
      targetLevel: rows[0].target_level,
      status: rows[0].status,
      revision: rows[0].revision,
      profileSnapshot: rows[0].profile_snapshot,
      createdAt: rows[0].created_at,
      reassessmentState,
      canReassess: reassessmentState === 'READY',
      lastReassessment: latest
        ? {
            previousLevel: latest.previous_level,
            assessedLevel: latest.assessed_level,
            preservedStages: latest.decision.preservedStages ?? 0,
            replacedStages: latest.decision.skippedStages ?? 0,
            generatedStages: latest.decision.generatedStages ?? 0,
            createdAt: latest.created_at,
          }
        : null,
      stages: rows[0].stage_id
        ? rows.map((row) => ({
            id: Number(row.stage_id),
            position: row.position,
            fromLevel: row.from_level,
            toLevel: row.to_level,
            status: row.stage_status,
            rationale: row.rationale,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            course: row.course_id
              ? {
                  id: Number(row.course_id),
                  title: row.course_title,
                  slug: row.course_slug,
                  price: Number(row.course_price),
                }
              : null,
            instructor: row.instructor_id
              ? { id: Number(row.instructor_id), name: row.instructor_name }
              : null,
          }))
        : [],
    };
  }

  private async getReassessmentState(
    manager: EntityManager,
    roadmapId: number,
    userId: number,
  ): Promise<RoadmapReassessmentState> {
    const rows: Array<{
      has_completed_stage: boolean;
      has_fresh_assessment: boolean;
    }> = await manager.query(
      `WITH completed_stage AS (
         SELECT MAX(s.completed_at) AS completed_at
         FROM learning_roadmap_stages s
         WHERE s.roadmap_id = $1 AND s.status = 'COMPLETED'
           AND s.completed_at > COALESCE((
             SELECT MAX(created_at) FROM roadmap_reassessments
             WHERE roadmap_id = $1
           ), '-infinity'::timestamptz)
       )
       SELECT
         cs.completed_at IS NOT NULL AS has_completed_stage,
         cs.completed_at IS NOT NULL AND (
           EXISTS (SELECT 1 FROM student_quiz_attempts
                   WHERE user_id = $2 AND created_at > cs.completed_at
                     AND item_count >= 15 AND band IS NOT NULL)
           OR EXISTS (SELECT 1 FROM student_assessments
                      WHERE user_id = $2 AND created_at > cs.completed_at
                        AND cefr_band IS NOT NULL)
         ) AS has_fresh_assessment
       FROM completed_stage cs`,
      [roadmapId, userId],
    );
    return roadmapReassessmentState(
      rows[0]?.has_completed_stage ?? false,
      rows[0]?.has_fresh_assessment ?? false,
    );
  }
}
