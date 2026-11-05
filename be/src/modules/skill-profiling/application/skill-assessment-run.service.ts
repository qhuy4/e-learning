import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SkillExtractorService } from './extractors/skill-extractor.service';
import { SkillAggregationService } from './skill-aggregation.service';
import { SKILL_AGGREGATION_CONFIG } from './skill-aggregation.config';

export type AssessmentTrigger = 'MANUAL' | 'SCHEDULED' | 'EVIDENCE_CHANGED';

@Injectable()
export class SkillAssessmentRunService {
  private readonly logger = new Logger(SkillAssessmentRunService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly extractor: SkillExtractorService,
    private readonly aggregation: SkillAggregationService,
  ) {}

  async executeForUser(userId: number, trigger: AssessmentTrigger) {
    const rows: Array<{ id: string | number }> = await this.dataSource.query(
      'SELECT id FROM instructor_profiles WHERE user_id = $1 LIMIT 1',
      [userId],
    );
    return rows[0] ? this.execute(Number(rows[0].id), trigger) : null;
  }

  async executeForCourse(
    courseId: string | number,
    trigger: AssessmentTrigger,
  ) {
    const rows: Array<{ id: string | number }> = await this.dataSource.query(
      `SELECT ip.id
       FROM courses c
       JOIN instructor_profiles ip ON ip.user_id = c.instructor_id
       WHERE c.id = $1 LIMIT 1`,
      [courseId],
    );
    return rows[0] ? this.execute(Number(rows[0].id), trigger) : null;
  }

  async onEvidenceChangedForUser(userId: number): Promise<void> {
    try {
      await this.executeForUser(userId, 'EVIDENCE_CHANGED');
    } catch (error) {
      this.logger.error(
        `Skill refresh failed for user ${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async onEvidenceChangedForCourse(courseId: string | number): Promise<void> {
    try {
      await this.executeForCourse(courseId, 'EVIDENCE_CHANGED');
    } catch (error) {
      this.logger.error(
        `Skill refresh failed for course ${courseId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * One durable run per refresh. A session advisory lock spans extraction,
   * and aggregation. After waiting for the lock, an older run
   * yields to any newer run, so stale work can never overwrite a newer result.
   * The aggregation transaction atomically writes history, snapshots, latest
   * projection and SUCCEEDED status.
   */
  async execute(instructorId: number, trigger: AssessmentTrigger) {
    const inserted: Array<{ id: string | number }> =
      await this.dataSource.query(
        `INSERT INTO skill_assessment_runs
         (instructor_id, trigger_type, processing_status, algorithm_version)
       VALUES ($1, $2, 'PROCESSING', $3)
       RETURNING id`,
        [instructorId, trigger, SKILL_AGGREGATION_CONFIG.modelVersion],
      );
    const runId = Number(inserted[0].id);
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    const lockKey = `skill-assessment:${instructorId}`;

    try {
      await runner.query('SELECT pg_advisory_lock(hashtextextended($1, 0))', [
        lockKey,
      ]);
      const newer: Array<{ id: string | number }> = await runner.query(
        `SELECT id FROM skill_assessment_runs
         WHERE instructor_id = $1 AND id > $2
         ORDER BY id DESC LIMIT 1`,
        [instructorId, runId],
      );
      if (newer.length > 0) {
        await runner.query(
          `UPDATE skill_assessment_runs
           SET processing_status = 'SUPERSEDED', completed_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [runId],
        );
        return { runId, status: 'SUPERSEDED' as const };
      }

      const extracted = await this.extractor.refreshForInstructor(instructorId);
      await this.aggregation.recompute(instructorId, runId);
      const statusRows: Array<{ processing_status: string }> =
        await runner.query(
          'SELECT processing_status FROM skill_assessment_runs WHERE id = $1',
          [runId],
        );
      const status = statusRows[0]?.processing_status ?? 'FAILED';
      if (status !== 'SUCCEEDED') {
        return { runId, status, extracted };
      }
      return {
        runId,
        status,
        extracted,
      };
    } catch (error) {
      await runner.query(
        `UPDATE skill_assessment_runs
         SET processing_status = 'FAILED', error = $2,
             completed_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND processing_status = 'PROCESSING'`,
        [runId, error instanceof Error ? error.message : String(error)],
      );
      throw error;
    } finally {
      try {
        await runner.query(
          'SELECT pg_advisory_unlock(hashtextextended($1, 0))',
          [lockKey],
        );
      } finally {
        await runner.release();
      }
    }
  }
}
