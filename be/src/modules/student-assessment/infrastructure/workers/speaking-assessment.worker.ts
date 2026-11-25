import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import {
  SpeakingAssessmentService,
  SpeakingAttemptRow,
  SpeakingProcessingError,
} from '@/modules/student-assessment/application/speaking-assessment.service';

const MAX_ATTEMPTS = 4;
const BATCH_SIZE = 2;
const STALE_LOCK_MINUTES = 3;

@Injectable()
export class SpeakingAssessmentWorker {
  private readonly logger = new Logger(SpeakingAssessmentWorker.name);
  private running = false;

  constructor(
    private readonly dataSource: DataSource,
    private readonly speaking: SpeakingAssessmentService,
  ) {}

  @Interval(5_000)
  async processQueue() {
    if (this.running) return;
    this.running = true;
    try {
      const attempts = await this.claimBatch();
      for (const attempt of attempts) {
        try {
          await this.speaking.processClaimedAttempt(attempt);
        } catch (error) {
          const processingError =
            error instanceof SpeakingProcessingError ? error : null;
          await this.scheduleRetry(
            processingError?.attempt ?? attempt,
            processingError?.stage ?? 'TRANSCRIPTION',
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Không xử lý được hàng đợi Speaking: ${(error as Error).message}`,
      );
    } finally {
      this.running = false;
    }
  }

  private async claimBatch(): Promise<SpeakingAttemptRow[]> {
    const result: unknown = await this.dataSource.query(
      `UPDATE student_speaking_attempts AS target
       SET locked_at = CURRENT_TIMESTAMP,
           processing_attempts = target.processing_attempts + 1,
           transcription_status = CASE
             WHEN target.transcript IS NULL THEN 'PROCESSING'
             ELSE target.transcription_status
           END,
           assessment_status = CASE
             WHEN target.transcription_status = 'COMPLETED'
               AND target.transcript IS NOT NULL THEN 'PROCESSING'
             ELSE 'PENDING'
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE target.id IN (
         SELECT queued.id
         FROM student_speaking_attempts AS queued
         WHERE queued.processing_attempts < $1
           AND queued.next_attempt_at <= CURRENT_TIMESTAMP
           AND (
             queued.locked_at IS NULL
             OR queued.locked_at < CURRENT_TIMESTAMP - ($2 * INTERVAL '1 minute')
           )
           AND (
             queued.transcription_status = 'PROCESSING'
             OR (
               queued.transcription_status = 'COMPLETED'
               AND queued.assessment_status IN ('PENDING', 'PROCESSING')
             )
           )
         ORDER BY queued.next_attempt_at, queued.id
         LIMIT $3
         FOR UPDATE SKIP LOCKED
       )
       RETURNING target.*, target.xmin::text AS row_version`,
      [MAX_ATTEMPTS, STALE_LOCK_MINUTES, BATCH_SIZE],
    );
    return Array.isArray(result) && Array.isArray(result[0])
      ? (result[0] as SpeakingAttemptRow[])
      : (result as SpeakingAttemptRow[]);
  }

  private async scheduleRetry(
    attempt: SpeakingAttemptRow,
    stage: 'TRANSCRIPTION' | 'ASSESSMENT',
  ) {
    const terminal = Number(attempt.processing_attempts) >= MAX_ATTEMPTS;
    const delaySeconds = Math.min(
      120,
      10 * 2 ** Math.max(0, Number(attempt.processing_attempts) - 1),
    );
    const errorCode =
      stage === 'TRANSCRIPTION'
        ? 'TRANSCRIPTION_UNAVAILABLE'
        : 'ASSESSMENT_UNAVAILABLE';

    await this.dataSource.query(
      `UPDATE student_speaking_attempts
       SET transcription_status = CASE
             WHEN $1 = 'TRANSCRIPTION' AND $2 THEN 'FAILED'
             WHEN $1 = 'TRANSCRIPTION' THEN 'PROCESSING'
             ELSE transcription_status
           END,
           transcription_error = CASE
             WHEN $1 = 'TRANSCRIPTION' THEN $3
             ELSE transcription_error
           END,
           assessment_status = CASE
             WHEN $1 = 'ASSESSMENT' AND $2 THEN 'FAILED'
             WHEN $1 = 'ASSESSMENT' THEN 'PENDING'
             ELSE assessment_status
           END,
           assessment_error = CASE
             WHEN $1 = 'ASSESSMENT' THEN $3
             ELSE assessment_error
           END,
           next_attempt_at = CURRENT_TIMESTAMP + ($4 * INTERVAL '1 second'),
           locked_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND xmin = $6::xid`,
      [
        stage,
        terminal,
        errorCode,
        delaySeconds,
        attempt.id,
        attempt.row_version,
      ],
    );
  }
}
