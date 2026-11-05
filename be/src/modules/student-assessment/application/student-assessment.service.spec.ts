import { StudentAssessmentService } from './student-assessment.service';

/**
 * Test phản hồi API của /student-assessment/* (đặc biệt grammar.qualityScore)
 * với DataSource được mock — không cần DB hay model service thật.
 */

interface RawRow {
  id: number;
  cefr_band: string | null;
  cefr_mean_level: number | null;
  vocab_coverage: number | null;
  vocab_low_confidence: boolean | null;
  grammar_error_signal: number | null;
  grammar_reliability: string | null;
  word_count: number | null;
  accepted_changes: number | null;
  rejected_changes: number | null;
  grammar_model_version: string | null;
  vocab_model_version: string | null;
  raw: Record<string, unknown> | null;
  created_at: string;
}

function row(overrides: Partial<RawRow> = {}): RawRow {
  return {
    id: 25,
    cefr_band: 'A2',
    cefr_mean_level: 1.33,
    vocab_coverage: 0.984,
    vocab_low_confidence: false,
    grammar_error_signal: 4.84,
    grammar_reliability: 'high',
    word_count: 62,
    accepted_changes: 3,
    rejected_changes: 0,
    grammar_model_version: '3a282927e75b',
    vocab_model_version: '2f0ef7197ccc',
    raw: {
      vocab: { bandSource: 'freetext-model', analyzedTokens: 17 },
      grammar: {
        status: 'corrected',
        confidence: 1,
        errorSignalPer100w: 4.84,
        reliability: 'high',
        changes: [
          {
            type: 'replace',
            original: 'makes',
            corrected: 'make',
            accepted: true,
            chunk: 0,
          },
        ],
      },
      focus: [
        { code: 'grammar', weight: 1.468, reason: 'r', weightPct: 32.9 },
      ],
    },
    created_at: '2026-11-04T02:18:59.262Z',
    ...overrides,
  };
}

function serviceReturning(rows: RawRow[]): StudentAssessmentService {
  const dataSource = { query: jest.fn().mockResolvedValue(rows) };
  return new StudentAssessmentService(
    dataSource as never,
    {} as never,
    {} as never,
    {} as never,
  );
}

/** latest() trả null khi không có dữ liệu — helper này assert có dữ liệu. */
async function latestOf(
  service: StudentAssessmentService,
  userId: number,
): Promise<NonNullable<Awaited<ReturnType<StudentAssessmentService['latest']>>>> {
  const res = await service.latest(userId);
  if (res === null) throw new Error(`user ${userId} không có assessment`);
  return res;
}

describe('GET /student-assessment/latest — grammar.qualityScore', () => {
  it('trả qualityScore = 100 − errorSignalPer100w và GIỮ NGUYÊN errorSignalPer100w', async () => {
    const res = await latestOf(serviceReturning([row()]), 47);

    expect(res.grammar.errorSignalPer100w).toBe(4.84);
    expect(res.grammar.qualityScore).toBe(95.16);
    // hai đại lượng phải khác nhau — quality không thay thế density
    expect(res.grammar.qualityScore).not.toBe(res.grammar.errorSignalPer100w);
  });

  it('0 lỗi với bài có từ → qualityScore 100 (trước đây thanh 0%)', async () => {
    const res = await latestOf(
      serviceReturning([
        row({
          grammar_error_signal: 0,
          grammar_reliability: 'low',
          word_count: 40,
          accepted_changes: 0,
          rejected_changes: 0,
          raw: {
            vocab: { bandSource: 'freetext-model' },
            grammar: {
              status: 'unchanged:no_change',
              confidence: 0.9,
              changes: [],
            },
            focus: [],
          },
        }),
      ]),
      7,
    );

    expect(res.grammar.errorSignalPer100w).toBe(0);
    expect(res.grammar.qualityScore).toBe(100);
  });

  it('signal null (model chưa chạy) → qualityScore null, KHÔNG bịa điểm', async () => {
    const res = await latestOf(
      serviceReturning([
        row({
          grammar_error_signal: null,
          grammar_reliability: 'unavailable',
          word_count: 50,
          accepted_changes: null,
          rejected_changes: null,
          raw: {
            vocab: { bandSource: 'freetext-model' },
            grammar: { status: null, confidence: null, changes: [] },
            focus: [],
          },
        }),
      ]),
      7,
    );

    expect(res.grammar.errorSignalPer100w).toBeNull();
    expect(res.grammar.qualityScore).toBeNull();
    expect(res.grammar.reliability).toBe('unavailable');
  });

  it('word_count = 0 (bài rỗng) → qualityScore null dù signal là 0', async () => {
    const res = await latestOf(
      serviceReturning([
        row({ grammar_error_signal: 0, word_count: 0, raw: { focus: [] } }),
      ]),
      7,
    );

    expect(res.grammar.qualityScore).toBeNull();
  });

  it('qualityScore KHÔNG được suy ra từ confidence — confidence null vẫn có điểm', async () => {
    const res = await latestOf(
      serviceReturning([
        row({
          grammar_error_signal: 2,
          word_count: 50,
          grammar_reliability: 'medium',
          raw: {
            vocab: { bandSource: 'freetext-model' },
            grammar: { status: 'corrected', confidence: null, changes: [] },
            focus: [],
          },
        }),
      ]),
      7,
    );

    expect(res.grammar.confidence).toBeNull();
    expect(res.grammar.qualityScore).toBe(98);
  });

  it('passthrough: changes, acceptedChanges, rejectedChanges và modelVersions giữ nguyên', async () => {
    const res = await latestOf(serviceReturning([row()]), 47);

    expect(res.grammar.changes).toHaveLength(1);
    expect(res.grammar.changes[0]).toMatchObject({
      original: 'makes',
      corrected: 'make',
      accepted: true,
    });
    expect(res.grammar.acceptedChanges).toBe(3);
    expect(res.grammar.rejectedChanges).toBe(0);
    expect(res.modelVersions).toEqual({
      grammar: '3a282927e75b',
      vocab: '2f0ef7197ccc',
    });
    expect(res.cefr.band).toBe('A2');
    expect(res.cefr.provisional).toBe(true);
    expect(res.focusTargets).toHaveLength(1);
  });

  it('user chưa có assessment nào → null (hợp đồng cũ không đổi)', async () => {
    await expect(serviceReturning([]).latest(999)).resolves.toBeNull();
  });
});
