import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';
import { LearnerProfileService } from '@/modules/student-assessment/application/learner-profile.service';
import {
  speakingPrompt,
  speakingPromptById,
} from '@/modules/student-assessment/domain/speaking-prompts';
import { CloudTranscriptionService } from '@/modules/student-assessment/infrastructure/cloud-transcription.service';
import {
  CloudSpeakingEvaluationService,
  SpeakingEvaluation,
} from '@/modules/student-assessment/infrastructure/cloud-speaking-evaluation.service';
import { SpeakingSubmitDto } from '@/modules/student-assessment/presentation/dto/speaking-submit.dto';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const RETRY_AFTER_MS = 3 * 60_000;
const AUDIO_EXTENSIONS: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/mp4': 'mp4',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/mpeg': 'mp3',
};

export interface SpeakingAttemptRow {
  row_version: string;
  id: string | number;
  user_id: string | number;
  prompt_id: string;
  level: string;
  duration_seconds: number;
  audio_key: string;
  audio_mime_type: string;
  audio_size: number;
  transcript: string | null;
  transcription_status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  transcription_model: string | null;
  transcription_error: string | null;
  assessment_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  grammar_score: number | null;
  vocabulary_score: number | null;
  fluency_score: number | null;
  overall_score: number | null;
  assessment_feedback: Record<string, unknown> | string | null;
  assessment_model: string | null;
  assessment_error: string | null;
  processing_attempts: number;
  next_attempt_at: Date | string;
  locked_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export type SpeakingProcessingStage = 'TRANSCRIPTION' | 'ASSESSMENT';

export class SpeakingProcessingError extends Error {
  constructor(
    readonly stage: SpeakingProcessingStage,
    readonly attempt: SpeakingAttemptRow,
  ) {
    super(`${stage}_UNAVAILABLE`);
    this.name = 'SpeakingProcessingError';
  }
}

@Injectable()
export class SpeakingAssessmentService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly profile: LearnerProfileService,
    private readonly transcription: CloudTranscriptionService,
    private readonly evaluation: CloudSpeakingEvaluationService,
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
  ) {}

  async prompt(userId: number) {
    const selected = await this.profile.resolveAssessmentLevel(userId);
    return {
      ...speakingPrompt(selected.level),
      selectionBasis: selected.basis,
    };
  }

  async submit(
    userId: number,
    dto: SpeakingSubmitDto,
    file?: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Vui lòng ghi âm trước khi nộp.');
    }
    const mimeType = file.mimetype.split(';')[0].toLowerCase();
    const extension = AUDIO_EXTENSIONS[mimeType];
    if (!extension) {
      throw new BadRequestException('Định dạng audio không được hỗ trợ.');
    }
    if (file.size > MAX_AUDIO_BYTES) {
      throw new BadRequestException('Bản ghi âm tối đa 10MB.');
    }

    const selected = await this.profile.resolveAssessmentLevel(userId);
    const prompt = speakingPromptById(dto.promptId);
    if (!prompt || prompt.level !== selected.level) {
      throw new BadRequestException(
        'Đề Speaking không khớp level tự đánh giá hiện tại.',
      );
    }
    if (dto.durationSeconds > prompt.responseSeconds + 5) {
      throw new BadRequestException('Thời lượng bản ghi không hợp lệ.');
    }

    const key = `student-assessments/speaking/${userId}/${randomUUID()}.${extension}`;
    await this.storage.upload({
      key,
      body: file.buffer,
      contentType: mimeType,
      contentLength: file.size,
    });

    try {
      const rows: SpeakingAttemptRow[] = await this.dataSource.query(
        `INSERT INTO student_speaking_attempts (
           user_id, prompt_id, level, duration_seconds, audio_key,
           audio_mime_type, audio_size, transcription_status,
           transcription_model, assessment_status, assessment_model,
           processing_attempts, next_attempt_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,'PROCESSING',$8,'PENDING',$9,0,CURRENT_TIMESTAMP)
         RETURNING *, xmin::text AS row_version`,
        [
          userId,
          prompt.id,
          prompt.level,
          dto.durationSeconds,
          key,
          mimeType,
          file.size,
          this.transcription.model,
          this.evaluation.model,
        ],
      );
      return this.toResponse(rows[0]);
    } catch (error) {
      await this.storage.delete(key).catch(() => undefined);
      throw error;
    }
  }

  async retry(userId: number, attemptId: number) {
    const attempt = await this.findAttempt(userId, attemptId);
    if (!this.canRetry(attempt)) return this.toResponse(attempt);

    const hasTranscript =
      attempt.transcription_status === 'COMPLETED' &&
      Boolean(attempt.transcript);
    const result: [SpeakingAttemptRow[], number] = await this.dataSource.query(
      `UPDATE student_speaking_attempts
       SET transcription_status = CASE WHEN $1 THEN 'COMPLETED' ELSE 'PROCESSING' END,
           transcription_error = CASE WHEN $1 THEN transcription_error ELSE NULL END,
           transcription_model = $2,
           assessment_status = 'PENDING', assessment_error = NULL,
           assessment_model = $3, processing_attempts = 0,
           next_attempt_at = CURRENT_TIMESTAMP, locked_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND xmin = $5::xid
       RETURNING *, xmin::text AS row_version`,
      [
        hasTranscript,
        this.transcription.model,
        this.evaluation.model,
        attemptId,
        attempt.row_version,
      ],
    );
    const rows = result[0];
    return this.toResponse(
      rows[0] ?? (await this.findAttempt(userId, attemptId)),
    );
  }

  async latest(userId: number) {
    const rows: SpeakingAttemptRow[] = await this.dataSource.query(
      `SELECT *, xmin::text AS row_version FROM student_speaking_attempts
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [userId],
    );
    return rows[0] ? this.toResponse(rows[0]) : null;
  }

  async processClaimedAttempt(attempt: SpeakingAttemptRow): Promise<void> {
    if (attempt.transcription_status === 'COMPLETED' && attempt.transcript) {
      await this.assess(attempt, attempt.transcript);
      return;
    }

    let transcript: string;
    try {
      const url = await this.storage.createDownloadUrl({
        key: attempt.audio_key,
        expiresIn: 300,
      });
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error('Không tải được bản ghi.');
      const audio = Buffer.from(await response.arrayBuffer());
      const extension = AUDIO_EXTENSIONS[attempt.audio_mime_type] ?? 'webm';
      transcript = await this.transcription.transcribe(
        audio,
        attempt.audio_mime_type,
        `speaking.${extension}`,
      );
    } catch {
      throw new SpeakingProcessingError('TRANSCRIPTION', attempt);
    }

    const result: [SpeakingAttemptRow[], number] = await this.dataSource.query(
      `UPDATE student_speaking_attempts
       SET transcript = $1, transcription_status = 'COMPLETED',
           transcription_error = NULL, assessment_status = 'PROCESSING',
           assessment_error = NULL, assessment_model = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND xmin = $4::xid
       RETURNING *, xmin::text AS row_version`,
      [transcript, this.evaluation.model, attempt.id, attempt.row_version],
    );
    if (result[0][0]) await this.assess(result[0][0], transcript);
  }

  private async assess(attempt: SpeakingAttemptRow, transcript: string) {
    let result: SpeakingEvaluation;
    try {
      result = await this.evaluation.evaluate(
        attempt.level,
        transcript,
        attempt.duration_seconds,
      );
    } catch {
      throw new SpeakingProcessingError('ASSESSMENT', attempt);
    }

    const feedback = {
      grammar: result.grammarFeedback,
      vocabulary: result.vocabularyFeedback,
      fluency: result.fluencyFeedback,
      wordCount: result.wordCount,
      wordsPerMinute: result.wordsPerMinute,
      fillerCount: result.fillerCount,
    };
    await this.dataSource.query(
      `UPDATE student_speaking_attempts
       SET assessment_status = 'COMPLETED', grammar_score = $1,
           vocabulary_score = $2, fluency_score = $3, overall_score = $4,
           assessment_feedback = $5::jsonb, assessment_error = NULL,
           locked_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND xmin = $7::xid
       RETURNING *, xmin::text AS row_version`,
      [
        result.grammarScore,
        result.vocabularyScore,
        result.fluencyScore,
        result.overallScore,
        JSON.stringify(feedback),
        attempt.id,
        attempt.row_version,
      ],
    );
  }

  private async findAttempt(userId: number, attemptId: number) {
    const rows: SpeakingAttemptRow[] = await this.dataSource.query(
      `SELECT *, xmin::text AS row_version FROM student_speaking_attempts
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [attemptId, userId],
    );
    if (!rows[0]) throw new NotFoundException('Không tìm thấy bài Speaking.');
    return rows[0];
  }

  private canRetry(row: SpeakingAttemptRow) {
    if (
      row.transcription_status === 'FAILED' ||
      row.assessment_status === 'FAILED'
    ) {
      return true;
    }
    const stale =
      Date.now() - new Date(row.updated_at).getTime() >= RETRY_AFTER_MS;
    if (row.transcription_status === 'PROCESSING') return stale;
    if (
      row.assessment_status === 'PROCESSING' ||
      row.assessment_status === 'PENDING'
    ) {
      return stale;
    }
    return false;
  }

  private async toResponse(row: SpeakingAttemptRow) {
    const audioUrl = await this.storage
      .createDownloadUrl({ key: row.audio_key, expiresIn: 3600 })
      .catch(() => null);
    const feedback =
      typeof row.assessment_feedback === 'string'
        ? (JSON.parse(row.assessment_feedback) as Record<string, unknown>)
        : row.assessment_feedback;
    return {
      attemptId: Number(row.id),
      promptId: row.prompt_id,
      level: row.level,
      durationSeconds: row.duration_seconds,
      audioUrl,
      transcript: row.transcript,
      transcriptionStatus: row.transcription_status,
      transcriptionModel: row.transcription_model,
      assessmentStatus: row.assessment_status,
      grammarScore: row.grammar_score,
      vocabularyScore: row.vocabulary_score,
      fluencyScore: row.fluency_score,
      overallScore: row.overall_score,
      assessmentFeedback: feedback,
      assessmentModel: row.assessment_model,
      canRetry: this.canRetry(row),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
