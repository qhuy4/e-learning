import { cefrIndex } from '@/modules/student-assessment/domain/cefr';

/**
 * Chuyển kết quả model (CEFR vocab + GEC) thành trọng số NHU CẦU học tập.
 *
 * Trọng số = mức độ hỗ trợ học viên cần ở kỹ năng đó (2.0 = cao, 0.5 = thấp).
 * KHÔNG phải điểm chất lượng giảng viên. Matching dùng trọng số này làm
 * trọng số trong fit = Σ(wᵢ·scoreᵢ)/Σwᵢ — giảng viên mạnh ở skill cần → fit cao.
 */

export type GrammarReliability = 'high' | 'medium' | 'low' | 'unavailable';

export interface FocusTargetDraft {
  /** Mã skill trong instructor_skills (grammar | vocabulary | writing). */
  code: string;
  weight: number;
  reason: string;
}

export interface GrammarSignalInput {
  status: string | null;
  confidence: number | null;
  acceptedChanges: number;
  /** acceptedChanges đã tính trọng số: word-change = 1.0, punctuation-only = 0.5. */
  weightedEdits: number;
  rejectedChanges: number;
  wordCount: number;
  chunkFailed: boolean;
  ran: boolean;
}

export interface GrammarSignal {
  /** Số edit được chấp nhận trên 100 từ — tín hiệu ước lượng, không phải error rate thật. */
  errorSignalPer100w: number | null;
  reliability: GrammarReliability;
  wordCount: number;
  acceptedChanges: number;
  rejectedChanges: number;
  status: string | null;
  confidence: number | null;
}

export interface VocabSignalInput {
  band: string | null;
  meanLevel: number | null;
  coverage: number | null;
  lowConfidence: boolean | null;
  bandSource: string | null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Tín hiệu lỗi ngữ pháp trên 100 từ.
 *
 * Mỗi accepted change = 1 edit; thay đổi chỉ gồm dấu câu (không có chữ)
 * tính 0.5. Đây là mật độ edit model chấp nhận, không phải tỷ lệ lỗi thật
 * (gating có thể loại lỗi thật → xem thêm reliability).
 */
export function computeGrammarSignal(input: GrammarSignalInput): GrammarSignal {
  const base: Omit<GrammarSignal, 'reliability' | 'errorSignalPer100w'> = {
    wordCount: input.wordCount,
    acceptedChanges: input.acceptedChanges,
    rejectedChanges: input.rejectedChanges,
    status: input.status,
    confidence: input.confidence,
  };

  if (!input.ran) {
    return { ...base, errorSignalPer100w: null, reliability: 'unavailable' };
  }

  const per100 =
    input.wordCount > 0
      ? Math.round((100 * input.weightedEdits) / input.wordCount * 100) / 100
      : 0;

  let reliability: GrammarReliability;
  if (input.chunkFailed) {
    reliability = 'low';
  } else if (
    input.status === 'corrected' &&
    (input.confidence ?? 0) >= 0.6
  ) {
    reliability = 'high';
  } else if (
    input.status?.startsWith('unchanged:no_change') &&
    input.wordCount >= 50
  ) {
    reliability = 'medium';
  } else {
    reliability = 'low';
  }

  return { ...base, errorSignalPer100w: per100, reliability };
}

/**
 * Grammar Quality Score — heuristic 0–100, KHÔNG phải accuracy đã hiệu chỉnh.
 *
 * Là phần bù của mật độ edit mà GEC chấp nhận trên 100 từ:
 *
 *   qualityScore = 100 − errorSignalPer100w   (kẹp trong [0, 100])
 *
 * Vì errorSignalPer100w = 100 · weightedEdits / wordCount, giá trị này đọc là
 * "tỷ lệ từ không bị model đụng tới". Đây chỉ là tín hiệu tham khảo từ một
 * model GEC duy nhất — KHÔNG phải phần trăm xác suất đúng, và KHÔNG phản ánh
 * confidence của model (xem GrammarSignal.confidence / reliability).
 *
 * Trả null khi thiếu bằng chứng — không bao giờ tự bịa điểm:
 *   - errorSignalPer100w là null (model chưa chạy / lỗi chunk)
 *   - wordCount <= 0 (bài viết rỗng hoặc toàn khoảng trắng)
 */
export function grammarQualityScore(
  errorSignalPer100w: number | null | undefined,
  wordCount: number | null | undefined,
): number | null {
  if (errorSignalPer100w == null) return null;
  if (wordCount == null || wordCount <= 0) return null;
  const clamped = clamp(100 - errorSignalPer100w, 0, 100);
  return Math.round(clamped * 100) / 100;
}

/** Trọng số grammar theo reliability + tín hiệu. */
export function grammarWeight(signal: GrammarSignal): number {
  switch (signal.reliability) {
    case 'high':
      return clamp(0.5 + (signal.errorSignalPer100w ?? 0) / 5, 0.5, 2.5);
    case 'medium':
      return clamp(1 + (signal.errorSignalPer100w ?? 0) / 10, 1, 2);
    case 'low':
    case 'unavailable':
    default:
      return 1.0;
  }
}

/** Trọng số vocabulary theo band CEFR (band thấp → cần hỗ trợ nhiều). */
export function vocabularyWeight(band: string | null): number {
  const idx = cefrIndex(band);
  if (idx < 0) return 1.5; // chưa xác định — trung tính
  if (idx <= 1) return 2.0; // A1–A2
  if (idx === 2) return 1.5; // B1
  if (idx === 3) return 1.0; // B2
  return 0.5; // C1–C2
}

/** Trọng số writing theo chất lượng tín hiệu vocab. */
export function writingWeight(vocab: VocabSignalInput): number {
  const lowSignal =
    vocab.lowConfidence === true ||
    (vocab.coverage != null && vocab.coverage < 0.5);
  if (lowSignal) return 1.5;
  const idx = cefrIndex(vocab.band);
  if (idx < 0) return 1.5;
  return idx < 3 ? 1.0 : 0.5; // < B2 → 1.0, B2+ → 0.5
}

export interface FocusTargetsInput {
  vocab: VocabSignalInput;
  grammar: GrammarSignal;
}

/** Danh sách focus target (chưa resolve skillId — service tra catalog). */
export function mapFocusTargets(input: FocusTargetsInput): FocusTargetDraft[] {
  const targets: FocusTargetDraft[] = [];

  const gw = grammarWeight(input.grammar);
  targets.push({
    code: 'grammar',
    weight: gw,
    reason:
      input.grammar.reliability === 'high'
        ? `Có ${input.grammar.acceptedChanges} lỗi ngữ pháp được sửa trên ${input.grammar.wordCount} từ`
        : input.grammar.reliability === 'medium'
          ? 'Tín hiệu ngữ pháp ở mức trung bình'
          : 'Tín hiệu ngữ pháp chưa đủ tin cậy — ưu tiên trung tính',
  });

  const vw = vocabularyWeight(input.vocab.band);
  targets.push({
    code: 'vocabulary',
    weight: vw,
    reason: input.vocab.band
      ? `Từ vựng ước lượng mức ${input.vocab.band}${
          input.vocab.lowConfidence ? ' (mức tin cậy thấp)' : ''
        }`
      : 'Chưa xác định được band từ vựng — ưu tiên trung tính',
  });

  const ww = writingWeight(input.vocab);
  targets.push({
    code: 'writing',
    weight: ww,
    reason:
      ww >= 1.5
        ? 'Bài viết có tín hiệu yếu (tín hiệu từ vựng ít hoặc thiếu tự tin)'
        : 'Kỹ năng viết là nền cho bài viết của bạn',
  });

  return targets;
}

export function weightPctSummary(targets: FocusTargetDraft[]): Array<
  FocusTargetDraft & { weightPct: number }
> {
  const total = targets.reduce((s, t) => s + t.weight, 0) || 1;
  return targets.map((t) => ({
    ...t,
    weightPct: Math.round((t.weight / total) * 1000) / 10,
  }));
}
