import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { SkillAssessmentRunService } from './skill-assessment-run.service';

/** Schedule cho skill refresh — env `SKILL_CRON`, mặc định 02:00 hàng ngày. */
const SKILL_CRON_EXPRESSION = process.env.SKILL_CRON?.trim() || '0 2 * * *';

/**
 * Cron Skill Profile (Bước 6): chạy pipeline đầy đủ cho TẤT CẢ instructor
 * định kỳ — giống hệt POST /skill-profile/refresh cho từng người:
 *   evidence extractor → feature extractor → aggregation (v2 + α-ramp blend).
 *
 * - Schedule: env `SKILL_CRON` (cron expression), mặc định 02:00 hàng ngày.
 * - Không chồng lấn: cờ `running` bỏ qua lần chạy mới khi lần trước chưa xong
 *   (mỗi instructor còn có advisory lock riêng nên manual refresh song song
 *   cũng an toàn).
 * - Lỗi 1 instructor không chặn các instructor còn lại (try/catch từng người).
 */
@Injectable()
export class SkillRefreshCronService implements OnModuleInit {
  private readonly logger = new Logger(SkillRefreshCronService.name);
  private running = false;

  constructor(
    private readonly dataSource: DataSource,
    private readonly assessmentRuns: SkillAssessmentRunService,
  ) {}

  onModuleInit(): void {
    this.logger.log(`Skill refresh cron scheduled: "${SKILL_CRON_EXPRESSION}"`);
  }

  @Cron(SKILL_CRON_EXPRESSION, { name: 'skill-refresh-all' })
  async handleCron(): Promise<void> {
    await this.refreshAll();
  }

  async refreshAll(): Promise<void> {
    if (this.running) {
      this.logger.warn('refreshAll skipped: previous run still in progress');
      return;
    }
    this.running = true;
    const startedAt = Date.now();
    try {
      const rows: Array<{ id: string | number }> = await this.dataSource.query(
        'SELECT id FROM instructor_profiles ORDER BY id',
      );
      let ok = 0;
      let failed = 0;
      for (const row of rows) {
        const profileId = Number(row.id);
        try {
          await this.assessmentRuns.execute(profileId, 'SCHEDULED');
          ok++;
        } catch (err) {
          failed++;
          this.logger.error(
            `refresh failed for profile ${profileId}: ${err instanceof Error ? err.message : err}`,
          );
        }
      }
      this.logger.log(
        `refreshAll done: ${ok} ok, ${failed} failed, ${rows.length} total, ${Date.now() - startedAt}ms`,
      );
    } finally {
      this.running = false;
    }
  }
}
