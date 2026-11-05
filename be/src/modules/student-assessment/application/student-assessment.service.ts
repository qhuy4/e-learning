import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createHash } from 'crypto';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { SkillCatalogRepository } from '@/modules/skill-profiling/infrastructure/repository/skill-catalog.repository';
import { SkillMatchingService } from '@/modules/skill-profiling/application/skill-matching.service';
import {
  ModelClientService,
  VocabFreeTextResponse,
} from '@/modules/student-assessment/infrastructure/model-client.service';
import {
  chunkWriting,
  countTotalWords,
  WritingChunk,
} from '@/modules/student-assessment/application/writing-chunker';
import {
  computeGrammarSignal,
  FocusTargetDraft,
  grammarQualityScore,
  GrammarSignal,
  GrammarSignalInput,
  mapFocusTargets,
  VocabSignalInput,
  weightPctSummary,
} from '@/modules/student-assessment/application/assessment-mapping';
import { MatchFromAssessmentDto } from '@/modules/student-assessment/presentation/dto/match-from-assessment.dto';

interface AssessmentRow {
  id: string | number;
  cefr_band: string | null;
  cefr_mean_level: string | number | null;
  vocab_coverage: string | number | null;
  vocab_low_confidence: boolean | null;
  grammar_error_signal: string | number | null;
  grammar_reliability: string | null;
  word_count: number | null;
  accepted_changes: number | null;
  rejected_changes: number | null;
  grammar_model_version: string | null;
  vocab_model_version: string | null;
  raw: AssessmentRaw | null;
  created_at: Date | string;
}

interface AssessmentRaw {
  vocab?: VocabSignalInput & {
    analyzedTokens?: number;
    totalTokens?: number;
  };
  grammar?: {
    status: string | null;
    confidence: number | null;
    errorSignalPer100w: number | null;
    reliability: string;
    chunkCount?: number;
    chunkFailures?: number;
    changes?: unknown[];
  };
  focus?: Array<FocusTargetDraft & { weightPct: number }>;
  provisional?: boolean;
}

const GRAMMAR_CHUNK_CONCURRENCY = 4;
const MAX_STORED_CHANGES = 200;

const GRAMMAR_SKILL_CODES = ['grammar', 'vocabulary', 'writing'] as const;

@Injectable()
export class StudentAssessmentService {
  private readonly logger = new Logger(StudentAssessmentService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly models: ModelClientService,
    private readonly catalog: SkillCatalogRepository,
    private readonly matching: SkillMatchingService,
  ) {}

  async analyze(userId: number, text: string) {
    const trimmed = text.trim();
    const wordCount = countTotalWords(trimmed);

    const health = await this.models.health();
    if (!health.vocab.ready) {
      throw new AppException(
        ErrorCode.MODEL_SERVICE_UNAVAILABLE,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const chunks = chunkWriting(trimmed);
    const grammarReady = health.grammar.ready;

    const [vocab, grammar] = await Promise.all([
      this.models.vocabFreeText(trimmed),
      grammarReady
        ? this.runGrammarChunks(chunks)
        : Promise.resolve({
            merged: null as null | MergedGrammar,
            failed: true,
          }),
    ]);

    const grammarSignal = this.buildGrammarSignal({
      merged: grammar.merged,
      failed: grammar.failed || !grammarReady,
      ran: grammarReady && grammar.merged !== null,
      wordCount,
    });

    const vocabInput: VocabSignalInput = {
      band: vocab.band,
      meanLevel: vocab.mean_level,
      coverage: vocab.coverage,
      lowConfidence: vocab.low_confidence,
      bandSource: vocab.band_source,
    };

    const focusDrafts = mapFocusTargets({ vocab: vocabInput, grammar: grammarSignal });
    const focusTargets = await this.resolveFocusTargets(focusDrafts);

    const versions = await this.models.getVersions();
    const raw: AssessmentRaw = {
      vocab: {
        ...vocabInput,
        analyzedTokens: vocab.analyzed_tokens,
        totalTokens: vocab.total_tokens,
      },
      grammar: {
        status: grammarSignal.status,
        confidence: grammarSignal.confidence,
        errorSignalPer100w: grammarSignal.errorSignalPer100w,
        reliability: grammarSignal.reliability,
        chunkCount: chunks.length,
        chunkFailures: grammar.failed ? 1 : 0,
        changes: grammar.merged?.changes.slice(0, MAX_STORED_CHANGES) ?? [],
      },
      focus: weightPctSummary(focusDrafts),
      provisional: true,
    };

    const inserted: Array<{ id: string | number; created_at: Date }> =
      await this.dataSource.query(
        `INSERT INTO student_assessments (
           user_id, cefr_band, cefr_mean_level, vocab_coverage,
           vocab_low_confidence, grammar_error_signal, grammar_reliability,
           word_count, accepted_changes, rejected_changes,
           grammar_model_version, vocab_model_version, text_sha256, raw
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb)
         RETURNING id, created_at`,
        [
          userId,
          vocab.band,
          vocab.mean_level,
          vocab.coverage,
          vocab.low_confidence,
          grammarSignal.errorSignalPer100w,
          grammarSignal.reliability,
          wordCount,
          grammarSignal.acceptedChanges,
          grammarSignal.rejectedChanges,
          versions.grammar,
          versions.vocab,
          createHash('sha256').update(trimmed).digest('hex'),
          JSON.stringify(raw),
        ],
      );

    const row: AssessmentRow = {
      id: inserted[0].id,
      cefr_band: vocab.band,
      cefr_mean_level: vocab.mean_level,
      vocab_coverage: vocab.coverage,
      vocab_low_confidence: vocab.low_confidence,
      grammar_error_signal: grammarSignal.errorSignalPer100w,
      grammar_reliability: grammarSignal.reliability,
      word_count: wordCount,
      accepted_changes: grammarSignal.acceptedChanges,
      rejected_changes: grammarSignal.rejectedChanges,
      grammar_model_version: versions.grammar,
      vocab_model_version: versions.vocab,
      raw,
      created_at: inserted[0].created_at,
    };

    return this.toResponse(row);
  }

  async latest(userId: number) {
    const rows: AssessmentRow[] = await this.dataSource.query(
      `SELECT id, cefr_band, cefr_mean_level, vocab_coverage, vocab_low_confidence,
              grammar_error_signal, grammar_reliability, word_count,
              accepted_changes, rejected_changes, grammar_model_version,
              vocab_model_version, raw, created_at
       FROM student_assessments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    );
    if (rows.length === 0) return null;
    return this.toResponse(rows[0]);
  }

  async matchFromAssessment(userId: number, dto: MatchFromAssessmentDto) {
    const row = dto.assessmentId
      ? await this.findOwned(userId, dto.assessmentId)
      : await this.findOwnedLatest(userId);
    if (!row) {
      throw new AppException(
        ErrorCode.ASSESSMENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const focus = row.raw?.focus ?? [];
    const targets: Array<{ skillId: number; weight: number }> = [];
    for (const f of focus) {
      const skill = await this.catalog.findByCode(f.code);
      if (skill?.is_active) {
        targets.push({ skillId: Number(skill.id), weight: Number(f.weight) });
      }
    }
    if (targets.length === 0) {
      throw new AppException(ErrorCode.SKILL_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    const result = await this.matching.match(
      { targets, limit: dto.limit ?? 10 },
      {
        studentLevel: row.cefr_band,
        requireLevelMatch: dto.requireLevelMatch ?? true,
      },
    );

    const needFit = await this.buildNeedFit(focus, result.ranked);

    return {
      assessment: {
        id: Number(row.id),
        cefrBand: row.cefr_band,
        createdAt: row.created_at,
        provisional: true,
      },
      ...result,
      needFit,
    };
  }

  // --- internals -----------------------------------------------------------

  /** Điểm fit giải thích cho FE (instructorMean theo từng target). */
  async buildNeedFit(
    focus: Array<FocusTargetDraft & { weightPct: number }>,
    ranked: Array<{
      matchedSkills: Array<{ skillId: number; score: number }>;
    }>,
  ) {
    const bySkill = new Map<number, { sum: number; n: number }>();
    for (const entry of ranked) {
      for (const m of entry.matchedSkills) {
        const acc = bySkill.get(m.skillId) ?? { sum: 0, n: 0 };
        acc.sum += m.score;
        acc.n += 1;
        bySkill.set(m.skillId, acc);
      }
    }

    const withMean = await Promise.all(
      focus.map(async (f) => {
        const skill = await this.catalog.findByCode(f.code);
        const acc = skill ? bySkill.get(Number(skill.id)) : undefined;
        const instructorMean =
          acc && acc.n > 0 ? Math.round((acc.sum / acc.n) * 1000) / 1000 : null;
        return {
          code: f.code,
          weight: f.weight,
          weightPct: f.weightPct,
          instructorMean,
        };
      }),
    );

    const weakest = withMean.reduce<(typeof withMean)[number] | null>(
      (min, cur) => {
        if (cur.instructorMean == null) return min ?? cur;
        if (min == null || min.instructorMean == null) return cur;
        return cur.instructorMean < min.instructorMean ? cur : min;
      },
      null,
    );

    return {
      targets: withMean,
      weakestTarget: weakest ? { code: weakest.code } : null,
      note: 'instructorMean = điểm trung bình của các giảng viên xếp hạng trên skill đó; null = chưa có dữ liệu',
    };
  }

  private async runGrammarChunks(chunks: WritingChunk[]): Promise<{
    merged: MergedGrammar | null;
    failed: boolean;
  }> {
    if (chunks.length === 0) return { merged: null, failed: false };

    const results = await this.mapWithConcurrency(
      chunks,
      GRAMMAR_CHUNK_CONCURRENCY,
      async (chunk) => ({
        chunk,
        response: await this.models.grammarCheck(chunk.text),
      }),
    );

    let failed = false;
    let confidence = Number.POSITIVE_INFINITY;
    const changes: MergedChange[] = [];
    let accepted = 0;
    let rejected = 0;
    let anyAccepted = false;
    const unchangedStatuses: string[] = [];

    for (const result of results) {
      if (!result.ok) {
        failed = true;
        continue;
      }
      const { chunk, response } = result.value;
      confidence = Math.min(confidence, response.confidence);
      for (const change of response.changes) {
        if (change.accepted) {
          accepted += 1;
          anyAccepted = true;
        } else {
          rejected += 1;
        }
        changes.push({
          ...change,
          char_start:
            change.char_start != null
              ? chunk.charOffset + change.char_start
              : null,
          char_end:
            change.char_end != null
              ? chunk.charOffset + change.char_end
              : null,
          chunk: chunk.index,
        });
      }
      if (response.status.startsWith('unchanged:')) {
        unchangedStatuses.push(response.status);
      }
    }

    if (accepted === 0 && rejected === 0) {
      // không có thay đổi nào ở mọi chunk
      return {
        merged: {
          status: unchangedStatuses[0] ?? 'unchanged:no_change',
          confidence: Number.isFinite(confidence) ? confidence : null,
          acceptedChanges: 0,
          weightedEdits: 0,
          rejectedChanges: 0,
          changes,
        },
        failed,
      };
    }

    const weightedEdits = changes
      .filter((c) => c.accepted)
      .reduce(
        (sum, c) => sum + (/\w/.test(`${c.original}${c.corrected}`) ? 1 : 0.5),
        0,
      );

    return {
      merged: {
        status: anyAccepted
          ? 'corrected'
          : (unchangedStatuses[0] ?? 'unchanged:all_changes_rejected'),
        confidence: Number.isFinite(confidence) ? confidence : null,
        acceptedChanges: accepted,
        weightedEdits,
        rejectedChanges: rejected,
        changes,
      },
      failed,
    };
  }

  private buildGrammarSignal(input: {
    merged: MergedGrammar | null;
    failed: boolean;
    ran: boolean;
    wordCount: number;
  }): GrammarSignal {
    const signalInput: GrammarSignalInput = {
      status: input.merged?.status ?? null,
      confidence: input.merged?.confidence ?? null,
      acceptedChanges: input.merged?.acceptedChanges ?? 0,
      weightedEdits: input.merged?.weightedEdits ?? 0,
      rejectedChanges: input.merged?.rejectedChanges ?? 0,
      wordCount: input.wordCount,
      chunkFailed: input.failed,
      ran: input.ran,
    };
    return computeGrammarSignal(signalInput);
  }

  private async resolveFocusTargets(
    drafts: FocusTargetDraft[],
  ): Promise<FocusTargetDraft[]> {
    const resolved: FocusTargetDraft[] = [];
    for (const draft of drafts) {
      if (!(GRAMMAR_SKILL_CODES as readonly string[]).includes(draft.code)) {
        continue;
      }
      const skill = await this.catalog.findByCode(draft.code);
      if (!skill?.is_active) {
        this.logger.warn(`focus target skill "${draft.code}" not active — skipped`);
        continue;
      }
      resolved.push(draft);
    }
    return resolved;
  }

  private async findOwned(
    userId: number,
    assessmentId: number,
  ): Promise<AssessmentRow | null> {
    const rows: AssessmentRow[] = await this.dataSource.query(
      `SELECT id, cefr_band, cefr_mean_level, vocab_coverage, vocab_low_confidence,
              grammar_error_signal, grammar_reliability, word_count,
              accepted_changes, rejected_changes, grammar_model_version,
              vocab_model_version, raw, created_at
       FROM student_assessments
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [assessmentId, userId],
    );
    return rows[0] ?? null;
  }

  private async findOwnedLatest(userId: number): Promise<AssessmentRow | null> {
    const rows: AssessmentRow[] = await this.dataSource.query(
      `SELECT id, cefr_band, cefr_mean_level, vocab_coverage, vocab_low_confidence,
              grammar_error_signal, grammar_reliability, word_count,
              accepted_changes, rejected_changes, grammar_model_version,
              vocab_model_version, raw, created_at
       FROM student_assessments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    );
    return rows[0] ?? null;
  }

  private toResponse(row: AssessmentRow) {
    const raw = row.raw ?? {};
    return {
      assessmentId: Number(row.id),
      createdAt: row.created_at,
      cefr: {
        band: row.cefr_band,
        meanLevel: row.cefr_mean_level == null ? null : Number(row.cefr_mean_level),
        coverage:
          row.vocab_coverage == null ? null : Number(row.vocab_coverage),
        lowConfidence: row.vocab_low_confidence,
        bandSource: raw.vocab?.bandSource ?? 'freetext-model',
        analyzedTokens: raw.vocab?.analyzedTokens ?? null,
        /** CEFR từ free-text là đánh giá tham khảo — không phải chứng nhận. */
        provisional: true,
      },
      grammar: (() => {
        const errorSignal =
          row.grammar_error_signal == null
            ? null
            : Number(row.grammar_error_signal);
        return {
          errorSignalPer100w: errorSignal,
          /**
           * Heuristic 0–100 (100 − errorSignalPer100w), KHÔNG phải accuracy
           * đã hiệu chỉnh và KHÔNG suy ra từ confidence. null = thiếu bằng
           * chứng — không bịa điểm. Tách khỏi errorSignalPer100w (mật độ).
           */
          qualityScore: grammarQualityScore(errorSignal, row.word_count),
          reliability: row.grammar_reliability,
          wordCount: row.word_count,
          acceptedChanges: row.accepted_changes,
          rejectedChanges: row.rejected_changes,
          status: raw.grammar?.status ?? null,
          confidence: raw.grammar?.confidence ?? null,
          changes: raw.grammar?.changes ?? [],
        };
      })(),
      focusTargets: raw.focus ?? [],
      modelVersions: {
        grammar: row.grammar_model_version,
        vocab: row.vocab_model_version,
      },
    };
  }

  private async mapWithConcurrency<T, R>(
    items: T[],
    limit: number,
    fn: (item: T, index: number) => Promise<R>,
  ): Promise<
    Array<{ ok: true; value: R } | { ok: false; error: unknown }>
  > {
    const results: Array<{ ok: true; value: R } | { ok: false; error: unknown }> =
      new Array(items.length);
    let next = 0;

    const worker = async () => {
      while (next < items.length) {
        const index = next++;
        try {
          results[index] = { ok: true, value: await fn(items[index], index) };
        } catch (error) {
          results[index] = { ok: false, error };
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(limit, items.length) }, worker),
    );
    return results;
  }
}

interface MergedChange {
  type: string;
  original: string;
  corrected: string;
  start: number;
  end: number;
  accepted: boolean;
  char_start: number | null;
  char_end: number | null;
  chunk: number;
}

interface MergedGrammar {
  status: string;
  confidence: number | null;
  acceptedChanges: number;
  weightedEdits: number;
  rejectedChanges: number;
  changes: MergedChange[];
}
