import {
  computeGrammarSignal,
  grammarQualityScore,
  grammarWeight,
  mapFocusTargets,
  vocabularyWeight,
  weightPctSummary,
  writingWeight,
  GrammarSignal,
  VocabSignalInput,
} from './assessment-mapping';

function grammarSignal(overrides: Partial<Parameters<typeof computeGrammarSignal>[0]> = {}): GrammarSignal {
  return computeGrammarSignal({
    status: 'corrected',
    confidence: 1.0,
    acceptedChanges: 5,
    weightedEdits: 5,
    rejectedChanges: 0,
    wordCount: 100,
    chunkFailed: false,
    ran: true,
    ...overrides,
  });
}

describe('computeGrammarSignal', () => {
  it('corrected + confidence >= 0.6 → high', () => {
    expect(grammarSignal().reliability).toBe('high');
  });

  it('errorSignalPer100w = 100 * weightedEdits / wordCount', () => {
    const s = grammarSignal({ acceptedChanges: 7, weightedEdits: 6.5, wordCount: 130 });
    expect(s.errorSignalPer100w).toBeCloseTo(5.0, 2);
  });

  it('unchanged:no_change + wordCount >= 50 → medium', () => {
    const s = grammarSignal({ status: 'unchanged:no_change', confidence: 0.9, acceptedChanges: 0, weightedEdits: 0, wordCount: 80 });
    expect(s.reliability).toBe('medium');
  });

  it('unchanged:no_change + wordCount < 30 → low', () => {
    const s = grammarSignal({ status: 'unchanged:no_change', confidence: 0.9, acceptedChanges: 0, weightedEdits: 0, wordCount: 20 });
    expect(s.reliability).toBe('low');
  });

  it('unchanged:low_confidence → low dù wordCount lớn', () => {
    const s = grammarSignal({ status: 'unchanged:low_confidence', confidence: 0.4, acceptedChanges: 0, weightedEdits: 0, wordCount: 100 });
    expect(s.reliability).toBe('low');
  });

  it('chunkFailed → low', () => {
    expect(grammarSignal({ chunkFailed: true }).reliability).toBe('low');
  });

  it('chưa chạy (grammar down) → unavailable, signal null', () => {
    const s = grammarSignal({ ran: false, acceptedChanges: 0, weightedEdits: 0 });
    expect(s.reliability).toBe('unavailable');
    expect(s.errorSignalPer100w).toBeNull();
  });
});

describe('grammarQualityScore (heuristic 0–100, không phải accuracy hiệu chỉnh)', () => {
  it('0 lỗi (signal 0) với bài có từ → 100', () => {
    expect(grammarQualityScore(0, 40)).toBe(100);
  });

  it('signal 4.84 / 62 từ → 95.16 (đối chiếu với bản ghi thật id=25)', () => {
    expect(grammarQualityScore(4.84, 62)).toBe(95.16);
  });

  it('clamped tại 0, không bao giờ âm dù signal rất lớn', () => {
    expect(grammarQualityScore(150, 50)).toBe(0);
    expect(grammarQualityScore(100, 50)).toBe(0);
  });

  it('clamped tại 100, không bao giờ vượt', () => {
    // signal âm là bất thường nhưng không được sinh điểm > 100
    expect(grammarQualityScore(-5, 50)).toBe(100);
  });

  it('signal null (model chưa chạy / lỗi chunk) → null, KHÔNG bịa 100', () => {
    expect(grammarQualityScore(null, 62)).toBeNull();
    expect(grammarQualityScore(undefined, 62)).toBeNull();
  });

  it('wordCount <= 0 (bài rỗng / toàn khoảng trắng) → null, KHÔNG bịa 100', () => {
    expect(grammarQualityScore(0, 0)).toBeNull();
    expect(grammarQualityScore(0, null)).toBeNull();
    expect(grammarQualityScore(0, undefined)).toBeNull();
    expect(grammarQualityScore(0, -10)).toBeNull();
  });

  it('TÁCH khỏi errorSignalPer100w: cùng input nhưng hai đại lượng khác nhau', () => {
    const signal = 4.84;
    const score = grammarQualityScore(signal, 62)!;
    expect(score).not.toBe(signal);
    expect(score).toBeCloseTo(100 - signal, 6);
  });

  it('làm tròn 2 chữ số thập phân', () => {
    // 100 · 7/130 = 5.384615… → signal 5.38 → score 94.62
    expect(grammarQualityScore(5.38, 130)).toBe(94.62);
  });

  it('không suy ra confidence: score cao không đổi được null confidence', () => {
    // score 100 với confidence null vẫn là hợp lệ — hai khái niệm độc lập
    expect(grammarQualityScore(0, 100)).toBe(100);
    expect(grammarQualityScore(null, 100)).toBeNull();
  });
});

describe('grammarWeight', () => {
  it('high: clamp(0.5 + signal/5, 0.5, 2.5)', () => {
    expect(grammarWeight(grammarSignal({ acceptedChanges: 5, weightedEdits: 5, wordCount: 100 }))).toBeCloseTo(1.5, 6);
    expect(grammarWeight(grammarSignal({ acceptedChanges: 25, weightedEdits: 25, wordCount: 100 }))).toBe(2.5);
    expect(grammarWeight(grammarSignal({ acceptedChanges: 0, weightedEdits: 0, wordCount: 100, status: 'corrected', confidence: 0.9 }))).toBe(0.5);
  });

  it('medium: clamp(1 + signal/10, 1, 2)', () => {
    const s = grammarSignal({ status: 'unchanged:no_change', confidence: 0.9, acceptedChanges: 0, weightedEdits: 0, wordCount: 80 });
    expect(grammarWeight(s)).toBe(1);
  });

  it('low/unavailable → 1.0 trung tính', () => {
    expect(grammarWeight(grammarSignal({ ran: false }))).toBe(1.0);
    expect(grammarWeight(grammarSignal({ chunkFailed: true }))).toBe(1.0);
  });
});

describe('vocabularyWeight (nhu cầu, không phải điểm năng lực)', () => {
  it.each([
    ['A1', 2.0],
    ['A2', 2.0],
    ['B1', 1.5],
    ['B2', 1.0],
    ['C1', 0.5],
    ['C2', 0.5],
    [null, 1.5],
  ])('band %s → weight %s', (band, weight) => {
    expect(vocabularyWeight(band as string | null)).toBe(weight);
  });
});

describe('writingWeight', () => {
  const base: VocabSignalInput = { band: 'B2', meanLevel: 3, coverage: 1, lowConfidence: false, bandSource: 'freetext-model' };

  it('low_confidence → 1.5', () => {
    expect(writingWeight({ ...base, lowConfidence: true })).toBe(1.5);
  });

  it('coverage < 0.5 → 1.5', () => {
    expect(writingWeight({ ...base, coverage: 0.3 })).toBe(1.5);
  });

  it('band < B2 → 1.0', () => {
    expect(writingWeight({ ...base, band: 'B1' })).toBe(1.0);
  });

  it('band >= B2 → 0.5', () => {
    expect(writingWeight(base)).toBe(0.5);
    expect(writingWeight({ ...base, band: 'C2' })).toBe(0.5);
  });
});

describe('mapFocusTargets', () => {
  it('trả 3 target grammar/vocabulary/writing, không auto speaking/listening/pronunciation', () => {
    const targets = mapFocusTargets({
      vocab: { band: 'A1', meanLevel: 0.2, coverage: 1, lowConfidence: false, bandSource: 'freetext-model' },
      grammar: grammarSignal(),
    });
    expect(targets.map((t) => t.code)).toEqual(['grammar', 'vocabulary', 'writing']);
    expect(targets.find((t) => t.code === 'grammar')!.weight).toBeCloseTo(1.5, 6);
    expect(targets.find((t) => t.code === 'vocabulary')!.weight).toBe(2.0);
    expect(targets.find((t) => t.code === 'writing')!.weight).toBe(1.0);
    for (const t of targets) expect(t.reason).toBeTruthy();
  });
});

describe('weightPctSummary', () => {
  it('weightPct tổng = 100', () => {
    const pct = weightPctSummary([
      { code: 'grammar', weight: 2, reason: '' },
      { code: 'vocabulary', weight: 1, reason: '' },
      { code: 'writing', weight: 1, reason: '' },
    ]);
    const total = pct.reduce((s, t) => s + t.weightPct, 0);
    expect(Math.abs(total - 100)).toBeLessThanOrEqual(0.1);
  });
});
