import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

export interface CombinedHealth {
  status: string;
  grammar: {
    ready: boolean;
    model: string;
    version: string | null;
    device: string | null;
    load_ms: number | null;
  };
  vocab: {
    ready: boolean;
    model: string;
    version: string | null;
    bank_version: string;
    load_ms: number | null;
  };
}

export interface GrammarChange {
  type: string;
  original: string;
  corrected: string;
  start: number;
  end: number;
  accepted: boolean;
  char_start?: number | null;
  char_end?: number | null;
  reject_reason?: string | null;
}

export interface GrammarCheckResponse {
  original: string;
  corrected: string;
  changes: GrammarChange[];
  unchanged: boolean;
  confidence: number;
  status: string;
  inference_ms: number;
}

export interface VocabFreeTextResponse {
  band: string | null;
  mean_level: number | null;
  analyzed_tokens: number;
  low_confidence: boolean;
  total_tokens: number;
  known_tokens: number;
  function_words_excluded: number;
  coverage: number;
  band_source: string;
  note?: string;
}

// --- Quiz từ vựng (GET /vocab/form, POST /vocab/score) ---------------------
// Hợp đồng khớp đúng service model đang chạy — KHÔNG suy diễn thêm.

export interface VocabFormItem {
  item_id: string;
  question: string;
  options: string[];
}

export interface VocabFormResponse {
  form_seed: number;
  instructions: string;
  items: VocabFormItem[];
}

export interface VocabScoreBandResult {
  band: string;
  correct: number;
  total: number;
}

export interface VocabScoreAbility {
  theta: number;
  se: number;
  model?: string;
}

export interface VocabScoreResponse {
  raw_score: number;
  total: number;
  per_band: VocabScoreBandResult[];
  /** Band chốt (Rasch khi calibration hợp lệ, ngược lại là heuristic). */
  band: string;
  band_source: string;
  ability: VocabScoreAbility | null;
  calibration: Record<string, unknown> | null;
  provisional_band: string;
  calibrated: boolean;
  note?: string | null;
}

export interface VocabScoreRequest {
  student?: string;
  form_seed?: number;
  responses: Array<{ item_id: string; answer: string }>;
}

const VERSION_CACHE_MS = 10 * 60 * 1000;

@Injectable()
export class ModelClientService {
  private readonly logger = new Logger(ModelClientService.name);
  private cachedVersions: {
    grammar: string | null;
    vocab: string | null;
    at: number;
  } | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  private get baseUrl(): string {
    return (
      this.config.get<string>('MODEL_SERVICE_URL') ?? 'http://localhost:8020'
    ).replace(/\/$/, '');
  }

  async health(): Promise<CombinedHealth> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<CombinedHealth>(`${this.baseUrl}/health`, {
          timeout: 5000,
        }),
      );
      return data;
    } catch {
      throw new AppException(
        ErrorCode.MODEL_SERVICE_UNAVAILABLE,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /** Versions cache 10 phút — chỉ để ghi vào assessment, không ảnh hưởng logic. */
  async getVersions(): Promise<{
    grammar: string | null;
    vocab: string | null;
  }> {
    const now = Date.now();
    if (
      this.cachedVersions &&
      now - this.cachedVersions.at < VERSION_CACHE_MS
    ) {
      return this.cachedVersions;
    }
    try {
      const health = await this.health();
      this.cachedVersions = {
        grammar: health.grammar.version,
        vocab: health.vocab.version,
        at: now,
      };
    } catch {
      // vẫn trả version cũ (nếu có) khi service tạm down
    }
    return this.cachedVersions ?? { grammar: null, vocab: null };
  }

  async grammarCheck(text: string): Promise<GrammarCheckResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<GrammarCheckResponse>(
          `${this.baseUrl}/grammar/v1/grammar/check`,
          { text },
          { timeout: 15000 },
        ),
      );
      return data;
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      this.logger.warn(`grammarCheck failed (HTTP ${status ?? 'n/a'})`);
      throw new AppException(
        ErrorCode.MODEL_SERVICE_ERROR,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async vocabFreeText(text: string): Promise<VocabFreeTextResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<VocabFreeTextResponse>(
          `${this.baseUrl}/vocab/free-text`,
          { text },
          { timeout: 20000 },
        ),
      );
      return data;
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      this.logger.warn(`vocabFreeText failed (HTTP ${status ?? 'n/a'})`);
      throw new AppException(
        ErrorCode.MODEL_SERVICE_ERROR,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /** Form 30 câu cloze (5/band A1–C2) — không kèm đáp án. */
  async vocabForm(seed?: number): Promise<VocabFormResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<VocabFormResponse>(`${this.baseUrl}/vocab/form`, {
          params: seed == null ? {} : { seed },
          timeout: 10000,
        }),
      );
      return data;
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      this.logger.warn(`vocabForm failed (HTTP ${status ?? 'n/a'})`);
      throw new AppException(
        ErrorCode.MODEL_SERVICE_UNAVAILABLE,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Chấm bài quiz. Model tự trả 422 khi item_id lạ/trùng/lựa chọn không
   * nằm trong options — mình chuyển tiếp thành VALIDATION_ERROR thay vì
   * che bằng lỗi model chung.
   */
  async vocabScore(payload: VocabScoreRequest): Promise<VocabScoreResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<VocabScoreResponse>(
          `${this.baseUrl}/vocab/score`,
          payload,
          { timeout: 20000 },
        ),
      );
      return data;
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      this.logger.warn(`vocabScore failed (HTTP ${status ?? 'n/a'})`);
      if (status === 422) {
        throw new AppException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      throw new AppException(
        ErrorCode.MODEL_SERVICE_UNAVAILABLE,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
