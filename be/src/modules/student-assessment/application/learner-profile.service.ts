import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { SkillCatalogRepository } from '@/modules/skill-profiling/infrastructure/repository/skill-catalog.repository';
import { SkillMatchingService } from '@/modules/skill-profiling/application/skill-matching.service';
import { ModelClientService } from '@/modules/student-assessment/infrastructure/model-client.service';
import { StudentAssessmentService } from '@/modules/student-assessment/application/student-assessment.service';
import {
  FocusTargetDraft,
  vocabularyWeight,
  weightPctSummary,
} from '@/modules/student-assessment/application/assessment-mapping';
import { QuizScoreDto } from '@/modules/student-assessment/presentation/dto/quiz-score.dto';
import { MatchFromProfileDto } from '@/modules/student-assessment/presentation/dto/match-from-profile.dto';

/**
 * Hồ sơ học viên hợp nhất cho skill-match 3 bước:
 *   Bước 1 self-assessment  → student_self_assessments
 *   Bước 2 quiz từ vựng     → student_quiz_attempts (model /vocab/score)
 *   Bước 2 writing (tuỳ chọn) → student_assessments (đã có từ Phase 1)
 *
 * Nguyên tắc: KHÔNG bịa điểm. Mỗi kỹ năng mang trạng thái
 * assessed | insufficient | not_assessed kèm nguồn bằng chứng.
 */

export type SkillAssessmentStatus =
  'assessed' | 'insufficient' | 'not_assessed';

export interface LearnerSkillStatus {
  code: string;
  status: SkillAssessmentStatus;
  band: string | null;
  source: 'quiz' | 'writing' | null;
  /** Heuristic 0–100 của grammar (null với kỹ năng khác) — không phải accuracy. */
  qualityScore: number | null;
  note: string;
}

/** Số câu tối thiểu (nửa form 30 câu) để chốt band từ quiz — heuristic minh bạch. */
const MIN_QUIZ_ITEMS_FOR_BAND = 15;

/** Kỹ năng chưa có nguồn đo nào — luôn not_assessed, không bao giờ được gán điểm. */
const UNASSESSED_SKILL_CODES = [
  'speaking',
  'listening',
  'reading',
  'pronunciation',
] as const;

/** reliability 'low' = tín hiệu yếu → insufficient, không phải assessed. */
const RELIABILITY_ASSESSED: readonly string[] = ['high', 'medium'];

interface QuizAttemptRow {
  id: string | number;
  form_seed: string | number;
  item_count: number;
  raw_score: number;
  band: string | null;
  band_source: string | null;
  provisional_band: string | null;
  theta: string | number | null;
  se: string | number | null;
  calibrated: boolean | null;
  per_band: unknown;
  raw: Record<string, unknown> | null;
  model_version: string | null;
  created_at: Date | string;
}

@Injectable()
export class LearnerProfileService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly models: ModelClientService,
    private readonly catalog: SkillCatalogRepository,
    private readonly matching: SkillMatchingService,
    private readonly assessments: StudentAssessmentService,
  ) {}

  // --- Bước 2: quiz --------------------------------------------------------

  /** Form 30 câu cloze (proxy /vocab/form) — không lộ đáp án. */
  async quizForm(seed?: number) {
    const form = await this.models.vocabForm(seed);
    return {
      formSeed: form.form_seed,
      instructions: form.instructions,
      items: form.items.map((item) => ({
        itemId: item.item_id,
        question: item.question,
        options: item.options,
      })),
    };
  }

  /** Chấm + lưu bài quiz. Partial submission hợp lệ (model tự chấm phần nộp). */
  async quizScore(userId: number, dto: QuizScoreDto) {
    const seen = new Set<string>();
    for (const response of dto.responses) {
      if (seen.has(response.item_id)) {
        // Model cũng 422 lỗi này — trả cùng loại lỗi để FE xử lý một kiểu.
        throw new AppException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      seen.add(response.item_id);
    }

    const score = await this.models.vocabScore({
      student: `user-${userId}`,
      form_seed: dto.form_seed,
      responses: dto.responses.map((r) => ({
        item_id: r.item_id,
        answer: r.answer,
      })),
    });

    const versions = await this.models.getVersions();
    const inserted: Array<{ id: string | number; created_at: Date }> =
      await this.dataSource.query(
        `INSERT INTO student_quiz_attempts (
           user_id, form_seed, item_count, raw_score, band, band_source,
           provisional_band, theta, se, calibrated, per_band, responses,
           raw, model_version
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13::jsonb,$14)
         RETURNING id, created_at`,
        [
          userId,
          dto.form_seed,
          score.total,
          score.raw_score,
          score.band,
          score.band_source,
          score.provisional_band,
          score.ability?.theta ?? null,
          score.ability?.se ?? null,
          score.calibrated,
          JSON.stringify(score.per_band),
          JSON.stringify(dto.responses),
          JSON.stringify(score),
          versions.vocab,
        ],
      );

    // Bước 1 có thể gửi kèm self-assessment để lưu cùng một lần gọi.
    const selfAssessment = dto.selfAssessedBand
      ? await this.saveSelfAssessment(userId, dto.selfAssessedBand)
      : null;

    return {
      ...this.quizAttemptResponse({
        id: inserted[0].id,
        form_seed: dto.form_seed,
        item_count: score.total,
        raw_score: score.raw_score,
        band: score.band,
        band_source: score.band_source,
        provisional_band: score.provisional_band,
        theta: score.ability?.theta ?? null,
        se: score.ability?.se ?? null,
        calibrated: score.calibrated,
        per_band: score.per_band,
        raw: null,
        model_version: versions.vocab,
        created_at: inserted[0].created_at,
      }),
      selfAssessment,
    };
  }

  /** Bài quiz gần nhất (null nếu chưa làm). */
  async latestQuiz(userId: number) {
    const rows: QuizAttemptRow[] = await this.dataSource.query(
      `SELECT id, form_seed, item_count, raw_score, band, band_source,
              provisional_band, theta, se, calibrated, per_band, raw,
              model_version, created_at
       FROM student_quiz_attempts
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [userId],
    );
    if (rows.length === 0) return null;
    return this.quizAttemptResponse(rows[0]);
  }

  // --- Bước 1: self-assessment ---------------------------------------------

  /** Lưu tự đánh giá (mỗi lần gọi = 1 bản ghi mới; profile lấy bản mới nhất). */
  async saveSelfAssessment(userId: number, band: string) {
    const rows: Array<{ band: string; created_at: Date }> =
      await this.dataSource.query(
        `INSERT INTO student_self_assessments (user_id, band)
         VALUES ($1, $2)
         RETURNING band, created_at`,
        [userId, band],
      );
    return { band: rows[0].band, updatedAt: rows[0].created_at };
  }

  private async latestSelfAssessment(userId: number) {
    const rows: Array<{ band: string; created_at: Date }> =
      await this.dataSource.query(
        `SELECT band, created_at
         FROM student_self_assessments
         WHERE user_id = $1
         ORDER BY created_at DESC, id DESC
         LIMIT 1`,
        [userId],
      );
    if (rows.length === 0) return null;
    return { band: rows[0].band, updatedAt: rows[0].created_at };
  }

  // --- Bước 3: hồ sơ hợp nhất ----------------------------------------------

  async getProfile(userId: number) {
    const [quiz, writing, selfAssessment] = await Promise.all([
      this.latestQuiz(userId),
      this.assessments.latest(userId),
      this.latestSelfAssessment(userId),
    ]);

    const writingInfo = writing
      ? {
          assessmentId: writing.assessmentId,
          cefrBand: writing.cefr.band,
          meanLevel: writing.cefr.meanLevel,
          lowConfidence: writing.cefr.lowConfidence,
          wordCount: writing.grammar.wordCount,
          grammarReliability: writing.grammar.reliability,
          grammarQualityScore: writing.grammar.qualityScore,
          /** CEFR từ free-text = tham khảo, không phải chứng nhận. */
          provisional: true,
          createdAt: writing.createdAt,
        }
      : null;

    const levelBand = writing?.cefr.band ?? this.usableQuizBand(quiz);
    const levelSource = writing?.cefr.band
      ? 'writing'
      : this.usableQuizBand(quiz)
        ? 'quiz'
        : null;

    return {
      selfAssessment,
      quiz,
      writing: writingInfo,
      levelBand,
      levelSource,
      skills: await this.buildSkillStatuses({ quiz, writing }),
    };
  }

  // --- Matching từ hồ sơ ----------------------------------------------------

  /**
   * Dùng focus đã lưu của writing (hành vi cũ giữ nguyên) + band quiz để
   * chốt trọng số vocabulary (bằng chứng trực tiếp thắng ước lượng free-text).
   */
  async matchFromProfile(userId: number, dto: MatchFromProfileDto) {
    const [quiz, writing] = await Promise.all([
      this.latestQuiz(userId),
      this.assessments.latest(userId),
    ]);
    if (!quiz && !writing) {
      throw new AppException(
        ErrorCode.ASSESSMENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const drafts: FocusTargetDraft[] = (writing?.focusTargets ?? []).map(
      (f) => ({
        code: f.code,
        weight: Number(f.weight),
        reason: f.reason,
      }),
    );

    if (quiz && quiz.total >= MIN_QUIZ_ITEMS_FOR_BAND && quiz.band) {
      const reason = `Quiz từ vựng ${quiz.total} câu → mức ${quiz.band}`;
      const idx = drafts.findIndex((d) => d.code === 'vocabulary');
      if (idx >= 0) {
        drafts[idx] = {
          code: 'vocabulary',
          weight: vocabularyWeight(quiz.band),
          reason,
        };
      } else {
        drafts.push({
          code: 'vocabulary',
          weight: vocabularyWeight(quiz.band),
          reason,
        });
      }
    }

    if (drafts.length === 0) {
      // Chưa có bằng chứng dùng được (quiz quá ngắn + chưa có writing).
      throw new AppException(
        ErrorCode.ASSESSMENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const targets: Array<{ skillId: number; weight: number }> = [];
    for (const draft of drafts) {
      const skill = await this.catalog.findByCode(draft.code);
      if (skill?.is_active) {
        targets.push({ skillId: Number(skill.id), weight: draft.weight });
      }
    }
    if (targets.length === 0) {
      throw new AppException(ErrorCode.SKILL_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    const levelBand = writing?.cefr.band ?? this.usableQuizBand(quiz);
    const result = await this.matching.match(
      { targets, limit: dto.limit ?? 10 },
      {
        studentLevel: levelBand,
        requireLevelMatch: dto.requireLevelMatch ?? true,
      },
    );

    const focus = weightPctSummary(drafts);
    const needFit = await this.assessments.buildNeedFit(focus, result.ranked);

    return {
      profile: {
        levelBand,
        levelSource: writing?.cefr.band
          ? 'writing'
          : this.usableQuizBand(quiz)
            ? 'quiz'
            : null,
        quizBand: this.usableQuizBand(quiz),
        writingBand: writing?.cefr.band ?? null,
      },
      ...result,
      needFit,
    };
  }

  // --- internals ------------------------------------------------------------

  /**
   * Band quiz CHỈ được dùng làm level khi đủ bằng chứng (≥15 câu).
   * Quiz nộp thiếu → không công bố level — không bịa band.
   */
  private usableQuizBand(
    quiz: Awaited<ReturnType<LearnerProfileService['latestQuiz']>>,
  ): string | null {
    if (!quiz || quiz.total < MIN_QUIZ_ITEMS_FOR_BAND) return null;
    return quiz.band;
  }

  private async buildSkillStatuses(input: {
    quiz: Awaited<ReturnType<LearnerProfileService['latestQuiz']>>;
    writing: Awaited<ReturnType<StudentAssessmentService['latest']>>;
  }): Promise<LearnerSkillStatus[]> {
    const statuses: LearnerSkillStatus[] = [];
    const { quiz, writing } = input;

    // vocabulary — từ quiz cloze
    if (!quiz) {
      statuses.push({
        code: 'vocabulary',
        status: 'not_assessed',
        band: null,
        source: null,
        qualityScore: null,
        note: 'Chưa làm quiz từ vựng',
      });
    } else if (quiz.total < MIN_QUIZ_ITEMS_FOR_BAND) {
      statuses.push({
        code: 'vocabulary',
        status: 'insufficient',
        band: null,
        source: 'quiz',
        qualityScore: null,
        note: `Chỉ nộp ${quiz.total}/${MIN_QUIZ_ITEMS_FOR_BAND} câu tối thiểu — chưa đủ bằng chứng để chốt band`,
      });
    } else {
      statuses.push({
        code: 'vocabulary',
        status: 'assessed',
        band: quiz.band,
        source: 'quiz',
        qualityScore: null,
        note: quiz.calibrated
          ? `Quiz ${quiz.total} câu — band từ ước lượng Rasch (SE ${
              quiz.ability?.se ?? 'n/a'
            })`
          : `Quiz ${quiz.total} câu — band tạm tính theo heuristic ≥80%/band`,
      });
    }

    // writing — từ bài viết
    if (!writing) {
      statuses.push({
        code: 'writing',
        status: 'not_assessed',
        band: null,
        source: null,
        qualityScore: null,
        note: 'Chưa nộp bài viết',
      });
    } else if (writing.cefr.band) {
      statuses.push({
        code: 'writing',
        status: 'assessed',
        band: writing.cefr.band,
        source: 'writing',
        qualityScore: null,
        note: `Bài viết ${writing.grammar.wordCount ?? '?'} từ — CEFR tham khảo từ free-text`,
      });
    } else {
      statuses.push({
        code: 'writing',
        status: 'insufficient',
        band: null,
        source: 'writing',
        qualityScore: null,
        note: 'Model chưa ước lượng được band từ bài viết này',
      });
    }

    // grammar — chỉ đánh giá được khi model GEC đã chạy trên bài viết
    if (!writing) {
      statuses.push({
        code: 'grammar',
        status: 'not_assessed',
        band: null,
        source: null,
        qualityScore: null,
        note: 'Chưa có bài viết để phân tích ngữ pháp',
      });
    } else if (
      writing.grammar.reliability != null &&
      RELIABILITY_ASSESSED.includes(writing.grammar.reliability)
    ) {
      statuses.push({
        code: 'grammar',
        status: 'assessed',
        band: null,
        source: 'writing',
        qualityScore: writing.grammar.qualityScore,
        note: 'Tín hiệu từ model GEC trên bài viết (qualityScore là heuristic, không phải % đúng)',
      });
    } else {
      statuses.push({
        code: 'grammar',
        status: 'insufficient',
        band: null,
        source: 'writing',
        qualityScore: null,
        note:
          writing.grammar.reliability == null ||
          writing.grammar.reliability === 'unavailable'
            ? 'Model ngữ pháp chưa chạy / không sẵn sàng'
            : 'Tín hiệu ngữ pháp quá yếu để kết luận',
      });
    }

    // Kỹ năng chưa có nguồn đo — luôn not_assessed.
    const catalogSkills = await this.catalog.findAll();
    const knownCodes = new Set(catalogSkills.map((s) => s.code));
    for (const code of UNASSESSED_SKILL_CODES) {
      if (!knownCodes.has(code)) continue;
      statuses.push({
        code,
        status: 'not_assessed',
        band: null,
        source: null,
        qualityScore: null,
        note: 'Chưa có bài kiểm tra cho kỹ năng này',
      });
    }

    return statuses;
  }

  private quizAttemptResponse(row: QuizAttemptRow) {
    return {
      attemptId: Number(row.id),
      formSeed: Number(row.form_seed),
      total: row.item_count,
      rawScore: row.raw_score,
      band: row.band,
      bandSource: row.band_source,
      provisionalBand: row.provisional_band,
      calibrated: row.calibrated === true,
      ability:
        row.theta == null
          ? null
          : {
              theta: Number(row.theta),
              se: row.se == null ? null : Number(row.se),
            },
      perBand: row.per_band ?? [],
      /** true = band chưa qua calibration Rasch (heuristic ≥80%/band). */
      provisional: row.calibrated !== true,
      modelVersion: row.model_version,
      createdAt: row.created_at,
    };
  }
}
