import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { MailService } from '@/modules/auth/services/mail.service';
import {
  InstructorEmailPayload,
  renderInstructorEmail,
} from '@/modules/instructor-applications/application/templates/instructor-email.templates';
import { InstructorEmailTemplate } from '@/modules/instructor-applications/domain/enums/instructor-email-template.enum';

interface ClaimedEmailRow {
  id: string;
  to_email: string;
  template: string;
  payload: InstructorEmailPayload | null;
  attempts: number;
}

const MAX_ATTEMPTS = 5;
const BATCH_SIZE = 10;

@Injectable()
export class EmailOutboxWorker {
  private readonly logger = new Logger(EmailOutboxWorker.name);
  private running = false;

  constructor(
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  @Interval(15_000)
  async processPendingEmails(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      const result: unknown = await this.dataSource.query(
        `
          UPDATE email_outbox
          SET status = 'PROCESSING', locked_at = NOW(), updated_at = NOW()
          WHERE id IN (
            SELECT id
            FROM email_outbox
            WHERE (
                status IN ('PENDING', 'FAILED')
                OR (
                  status = 'PROCESSING'
                  AND locked_at < NOW() - INTERVAL '5 minutes'
                )
              )
              AND next_attempt_at <= NOW()
              AND attempts < $1
            ORDER BY id ASC
            LIMIT $2
            FOR UPDATE SKIP LOCKED
          )
          RETURNING id, to_email, template, payload, attempts
        `,
        [MAX_ATTEMPTS, BATCH_SIZE],
      );

      // TypeORM/Postgres returns [rows, affectedCount] for UPDATE ... RETURNING.
      const rows: ClaimedEmailRow[] = Array.isArray(result) &&
        Array.isArray(result[0])
        ? (result[0] as ClaimedEmailRow[])
        : (result as ClaimedEmailRow[]);

      for (const row of rows) {
        await this.processRow(row);
      }
    } catch (error) {
      this.logger.error(
        `Email outbox worker failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
    } finally {
      this.running = false;
    }
  }

  private async processRow(row: ClaimedEmailRow): Promise<void> {
    try {
      if (
        !Object.values(InstructorEmailTemplate).includes(
          row.template as InstructorEmailTemplate,
        )
      ) {
        throw new Error(`Unknown email template: ${row.template}`);
      }

      const rendered = renderInstructorEmail(
        row.template as InstructorEmailTemplate,
        row.payload ?? {},
      );

      await this.mailService.sendHtml(
        row.to_email,
        rendered.subject,
        rendered.html,
      );

      await this.dataSource.query(
        `
          UPDATE email_outbox
          SET status = 'SENT', sent_at = NOW(), locked_at = NULL,
              last_error = NULL, updated_at = NOW()
          WHERE id = $1
        `,
        [row.id],
      );
    } catch (error) {
      const attempts = Number(row.attempts) + 1;
      const failed = attempts >= MAX_ATTEMPTS;
      const delaySeconds = Math.min(300, 15 * 2 ** (attempts - 1));

      this.logger.warn(
        `Email ${row.id} failed (attempt ${attempts}): ${(error as Error).message}`,
      );

      await this.dataSource.query(
        `
          UPDATE email_outbox
          SET status = $2, attempts = $3, locked_at = NULL,
              last_error = $4,
              next_attempt_at = NOW() + ($5 * INTERVAL '1 second'),
              updated_at = NOW()
          WHERE id = $1
        `,
        [
          row.id,
          failed ? 'FAILED' : 'PENDING',
          attempts,
          (error as Error).message,
          delaySeconds,
        ],
      );
    }
  }
}
