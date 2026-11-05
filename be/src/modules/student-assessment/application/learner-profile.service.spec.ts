import { HttpStatus } from '@nestjs/common';
import { LearnerProfileService } from './learner-profile.service';
import { ErrorCode } from '@/common/enum/error-code.enum';

/**
 * Test hồ sơ học viên hợp nhất (quiz + writing + self-assessment):
 * - trạng thái kỹ năng assessed / insufficient / not_assessed (không bịa điểm)
 * - trọng số target cho matching (quiz band thắng trọng số vocabulary)
 * DataSource/ModelClient/Catalog/Matching đều mock — không cần DB hay model.
 */

const TS = '2026-11-04T03:00:00.000Z';

const SKILLS: Record<string, number> = {
  grammar: 1,
  vocabulary: 2,
  speaking: 3,
  listening: 4,
  writing: 5,
  pronunciation: 6,
  reading: 1617,
};

interface Routes {
  quizRows?: unknown[];
  selfRows?: unknown[];
}

type MatchCall = [
  { targets: Array<{ skillId: number; weight: number }>; limit: number },
  { studentLevel: string | null; requireLevelMatch: boolean },
];

type FocusList = Array<{
  code: string;
  weight: number;
  reason: string;
  weightPct: number;
}>;

type MatchResult = {
  targets: unknown[];
  ranked: unknown[];
  insufficient: unknown[];
  meta: Record<string, number>;
};

type NeedFit = {
  targets: unknown[];
  weakestTarget: unknown;
  note: string;
};

type CatalogSkill = { id: number; code: string; is_active: boolean };

function makeDataSource(routes: Routes = {}) {
  const query = jest.fn<Promise<unknown[]>, [string, unknown[]?]>((sql) => {
    if (sql.includes('INSERT INTO student_quiz_attempts')) {
      return Promise.resolve([{ id: 91, created_at: TS }]);
    }
    if (sql.includes('INSERT INTO student_self_assessments')) {
      return Promise.resolve([{ band: 'A2', created_at: TS }]);
    }
    if (sql.includes('FROM student_quiz_attempts')) {
      return Promise.resolve(routes.quizRows ?? []);
    }
    if (sql.includes('FROM student_self_assessments')) {
      return Promise.resolve(routes.selfRows ?? []);
    }
    throw new Error(`SQL không mong đợi trong test: ${sql.slice(0, 60)}`);
  });
  return { query };
}

function makeService(routes: Routes = {}) {
  const dataSource = makeDataSource(routes);
  const models = {
    vocabForm: jest.fn(),
    vocabScore: jest.fn(),
    getVersions: jest.fn().mockResolvedValue({ grammar: 'g1', vocab: 'v1' }),
  };
  const catalog = {
    findByCode: jest.fn<Promise<CatalogSkill | null>, [string]>((code) =>
      Promise.resolve(
        SKILLS[code] ? { id: SKILLS[code], code, is_active: true } : null,
      ),
    ),
    findAll: jest.fn<Promise<CatalogSkill[]>, []>(() =>
      Promise.resolve(
        Object.entries(SKILLS).map(([code, id]) => ({
          id,
          code,
          is_active: true,
        })),
      ),
    ),
  };
  const match = jest.fn<Promise<MatchResult>, MatchCall>();
  match.mockResolvedValue({
    targets: [],
    ranked: [],
    insufficient: [],
    meta: { eligible: 0, rankedCount: 0, insufficientCount: 0 },
  });
  const matching = { match };

  const buildNeedFit = jest.fn<Promise<NeedFit>, [FocusList, unknown]>();
  buildNeedFit.mockResolvedValue({
    targets: [],
    weakestTarget: null,
    note: 'n',
  });
  const assessments = { latest: jest.fn(), buildNeedFit };

  const service = new LearnerProfileService(
    dataSource as never,
    models as never,
    catalog as never,
    matching as never,
    assessments as never,
  );
  return { service, dataSource, models, catalog, matching, assessments };
}

function quizRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 41,
    form_seed: 12345,
    item_count: 30,
    raw_score: 24,
    band: 'C1',
    band_source: 'rasch',
    provisional_band: 'C2',
    theta: 3.3354,
    se: 0.6221,
    calibrated: true,
    per_band: [{ band: 'A1', correct: 5, total: 5 }],
    raw: {},
    model_version: 'v1',
    created_at: TS,
    ...overrides,
  };
}

function writingResponse(overrides: Record<string, unknown> = {}) {
  return {
    assessmentId: 26,
    createdAt: TS,
    cefr: {
      band: 'A2',
      meanLevel: 1.33,
      coverage: 0.984,
      lowConfidence: false,
      bandSource: 'freetext-model',
      analyzedTokens: 17,
      provisional: true,
    },
    grammar: {
      errorSignalPer100w: 4.84,
      qualityScore: 95.16,
      reliability: 'high',
      wordCount: 62,
      acceptedChanges: 3,
      rejectedChanges: 0,
      status: 'corrected',
      confidence: 1,
      changes: [],
    },
    focusTargets: [
      { code: 'grammar', weight: 1.468, reason: 'g', weightPct: 32.9 },
      { code: 'vocabulary', weight: 1.5, reason: 'old-vocab', weightPct: 33.3 },
      { code: 'writing', weight: 1.0, reason: 'w', weightPct: 22.2 },
    ],
    modelVersions: { grammar: 'g1', vocab: 'v1' },
    ...overrides,
  };
}

const fullScore = {
  raw_score: 24,
  total: 30,
  per_band: [{ band: 'A1', correct: 5, total: 5 }],
  band: 'C1',
  band_source: 'rasch',
  ability: { theta: 3.3354, se: 0.6221, model: 'rasch-1pl' },
  calibration: { n_respondents: 50 },
  provisional_band: 'C2',
  calibrated: true,
  note: 'band from Rasch',
};

function scoreDto(overrides: Record<string, unknown> = {}) {
  return {
    form_seed: 12345,
    responses: [{ item_id: 'A1-02', answer: 'like' }],
    ...overrides,
  } as never;
}

// --- quiz ------------------------------------------------------------------

describe('POST /student-assessment/quiz/score', () => {
  it('chấm qua model và LƯU lại kết quả (không bịa điểm)', async () => {
    const { service, models, dataSource } = makeService();
    models.vocabScore.mockResolvedValue(fullScore);

    const res = await service.quizScore(47, scoreDto());

    expect(models.vocabScore).toHaveBeenCalledWith({
      student: 'user-47',
      form_seed: 12345,
      responses: [{ item_id: 'A1-02', answer: 'like' }],
    });
    const insert = dataSource.query.mock.calls.find(([sql]) =>
      String(sql).includes('INSERT INTO student_quiz_attempts'),
    );
    expect(insert).toBeTruthy();
    // params: user_id, form_seed, item_count, raw_score, band, band_source...
    expect(insert![1]).toEqual([
      47,
      12345,
      30,
      24,
      'C1',
      'rasch',
      'C2',
      3.3354,
      0.6221,
      true,
      expect.any(String),
      expect.any(String),
      expect.any(String),
      'v1',
    ]);

    expect(res).toMatchObject({
      attemptId: 91,
      total: 30,
      rawScore: 24,
      band: 'C1',
      bandSource: 'rasch',
      provisionalBand: 'C2',
      calibrated: true,
      provisional: false,
      ability: { theta: 3.3354, se: 0.6221 },
    });
    expect(res.selfAssessment).toBeNull();
  });

  it('band chưa calibration → provisional true (không tỏ ra chắc chắn)', async () => {
    const { service, models } = makeService();
    models.vocabScore.mockResolvedValue({
      ...fullScore,
      band: 'B1',
      band_source: 'provisional',
      calibrated: false,
      ability: null,
    });

    const res = await service.quizScore(47, scoreDto());

    expect(res.provisional).toBe(true);
    expect(res.ability).toBeNull();
  });

  it('item_id trùng → VALIDATION_ERROR 422, KHÔNG gọi model', async () => {
    const { service, models } = makeService();

    await expect(
      service.quizScore(
        47,
        scoreDto({
          responses: [
            { item_id: 'A1-02', answer: 'like' },
            { item_id: 'A1-02', answer: 'where' },
          ],
        }),
      ),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });
    expect(models.vocabScore).not.toHaveBeenCalled();
  });

  it('kèm selfAssessedBand → lưu luôn bản tự đánh giá Bước 1', async () => {
    const { service, models, dataSource } = makeService();
    models.vocabScore.mockResolvedValue(fullScore);

    const res = await service.quizScore(
      47,
      scoreDto({ selfAssessedBand: 'A2' }),
    );

    expect(
      dataSource.query.mock.calls.some(([sql]) =>
        String(sql).includes('INSERT INTO student_self_assessments'),
      ),
    ).toBe(true);
    expect(res.selfAssessment).toEqual({ band: 'A2', updatedAt: TS });
  });
});

describe('GET /student-assessment/quiz/form', () => {
  it('map sang camelCase cho FE, không thêm trường bịa đặt', async () => {
    const { service, models } = makeService();
    models.vocabForm.mockResolvedValue({
      form_seed: 99,
      instructions: 'Fill in the blank',
      items: [{ item_id: 'A1-02', question: 'Q?', options: ['a', 'b'] }],
    });

    const res = await service.quizForm(99);

    expect(models.vocabForm).toHaveBeenCalledWith(99);
    expect(res).toEqual({
      formSeed: 99,
      instructions: 'Fill in the blank',
      items: [{ itemId: 'A1-02', question: 'Q?', options: ['a', 'b'] }],
    });
  });
});

describe('GET /student-assessment/quiz/latest', () => {
  it('chưa làm bài nào → null (không bịa attempt)', async () => {
    const { service, dataSource } = makeService();

    const res = await service.latestQuiz(47);

    expect(res).toBeNull();
    expect(dataSource.query.mock.calls[0][1]).toEqual([47]);
  });

  it('bài gần nhất → camelCase, provisional = !calibrated, theta null an toàn', async () => {
    const { service, dataSource } = makeService({
      quizRows: [
        quizRow({ calibrated: false, theta: null, se: null, band: 'B1' }),
      ],
    });

    const res = await service.latestQuiz(47);

    const [sql] = dataSource.query.mock.calls[0];
    expect(String(sql)).toContain('ORDER BY created_at DESC');
    expect(String(sql)).toContain('LIMIT 1');
    expect(res).toMatchObject({
      attemptId: 41,
      formSeed: 12345,
      total: 30,
      rawScore: 24,
      band: 'B1',
      bandSource: 'rasch',
      calibrated: false,
      provisional: true,
      ability: null,
      perBand: [{ band: 'A1', correct: 5, total: 5 }],
      modelVersion: 'v1',
      createdAt: TS,
    });
  });
});

describe('POST /student-assessment/self-assessment', () => {
  it('lưu bản tự đánh giá và trả { band, updatedAt }', async () => {
    const { service, dataSource } = makeService();

    const res = await service.saveSelfAssessment(47, 'A2');

    expect(res).toEqual({ band: 'A2', updatedAt: TS });
    const insert = dataSource.query.mock.calls.find(([sql]) =>
      String(sql).includes('INSERT INTO student_self_assessments'),
    );
    expect(insert).toBeTruthy();
    expect(insert![1]).toEqual([47, 'A2']);
  });
});

// --- hồ sơ -----------------------------------------------------------------

describe('GET /student-assessment/profile', () => {
  it('quiz đạt ngưỡng → vocabulary assessed kèm band + nguồn', async () => {
    const { service, assessments } = makeService({
      quizRows: [quizRow()],
    });
    assessments.latest.mockResolvedValue(null);

    const profile = await service.getProfile(47);

    const vocab = profile.skills.find((s) => s.code === 'vocabulary');
    expect(vocab).toMatchObject({
      status: 'assessed',
      band: 'C1',
      source: 'quiz',
    });
    expect(profile.levelBand).toBe('C1');
    expect(profile.levelSource).toBe('quiz');
    expect(profile.writing).toBeNull();
    expect(profile.selfAssessment).toBeNull();
  });

  it('quiz nộp thiếu (<15 câu) → insufficient, KHÔNG công bố band', async () => {
    const { service, assessments } = makeService({
      quizRows: [quizRow({ item_count: 10, band: 'B1', calibrated: false })],
    });
    assessments.latest.mockResolvedValue(null);

    const profile = await service.getProfile(47);

    const vocab = profile.skills.find((s) => s.code === 'vocabulary');
    expect(vocab).toMatchObject({ status: 'insufficient', band: null });
    expect(vocab!.note).toContain('10/15');
    expect(profile.levelBand).toBeNull();
  });

  it('chưa làm quiz → vocabulary not_assessed', async () => {
    const { service, assessments } = makeService();
    assessments.latest.mockResolvedValue(null);

    const profile = await service.getProfile(47);

    expect(profile.skills.find((s) => s.code === 'vocabulary')).toMatchObject({
      status: 'not_assessed',
      band: null,
      source: null,
    });
  });

  it('writing + grammar model chạy → writing/grammar assessed, levelBand từ writing', async () => {
    const { service, assessments } = makeService();
    assessments.latest.mockResolvedValue(writingResponse());

    const profile = await service.getProfile(47);

    expect(profile.writing).toMatchObject({
      assessmentId: 26,
      cefrBand: 'A2',
      grammarQualityScore: 95.16,
      provisional: true,
    });
    expect(profile.skills.find((s) => s.code === 'writing')).toMatchObject({
      status: 'assessed',
      band: 'A2',
      source: 'writing',
    });
    const grammar = profile.skills.find((s) => s.code === 'grammar');
    expect(grammar).toMatchObject({ status: 'assessed', qualityScore: 95.16 });
    // writing thắng quiz ở level filter
    expect(profile.levelBand).toBe('A2');
    expect(profile.levelSource).toBe('writing');
  });

  it('grammar model không chạy → grammar insufficient, không gán qualityScore', async () => {
    const { service, assessments } = makeService();
    assessments.latest.mockResolvedValue(
      writingResponse({
        cefr: { ...writingResponse().cefr, band: 'A2' },
        grammar: {
          ...writingResponse().grammar,
          reliability: 'unavailable',
          qualityScore: null,
          errorSignalPer100w: null,
        },
      }),
    );

    const profile = await service.getProfile(47);

    const grammar = profile.skills.find((s) => s.code === 'grammar');
    expect(grammar).toMatchObject({
      status: 'insufficient',
      qualityScore: null,
    });
    expect(grammar!.note).toContain('chưa chạy');
  });

  it('writing chưa ước lượng được band → writing insufficient', async () => {
    const { service, assessments } = makeService();
    assessments.latest.mockResolvedValue(
      writingResponse({
        cefr: { ...writingResponse().cefr, band: null },
      }),
    );

    const profile = await service.getProfile(47);

    expect(profile.skills.find((s) => s.code === 'writing')).toMatchObject({
      status: 'insufficient',
      band: null,
    });
    expect(profile.levelBand).toBeNull();
  });

  it('kỹ năng chưa có nguồn đo luôn not_assessed, không bao giờ bị gán điểm', async () => {
    const { service, assessments } = makeService({
      quizRows: [quizRow()],
    });
    assessments.latest.mockResolvedValue(writingResponse());

    const profile = await service.getProfile(47);

    for (const code of ['speaking', 'listening', 'reading', 'pronunciation']) {
      expect(profile.skills.find((s) => s.code === code)).toMatchObject({
        status: 'not_assessed',
        band: null,
        source: null,
        qualityScore: null,
      });
    }
  });

  it('self-assessment gần nhất được trả cùng hồ sơ', async () => {
    const { service, assessments } = makeService({
      selfRows: [{ band: 'A2', created_at: TS }],
    });
    assessments.latest.mockResolvedValue(null);

    const profile = await service.getProfile(47);

    expect(profile.selfAssessment).toEqual({ band: 'A2', updatedAt: TS });
  });
});

// --- matching --------------------------------------------------------------

describe('POST /matching/from-profile', () => {
  it('chưa có bất kỳ assessment nào → 404', async () => {
    const { service, assessments } = makeService();
    assessments.latest.mockResolvedValue(null);

    await expect(service.matchFromProfile(47, {})).rejects.toMatchObject({
      code: ErrorCode.ASSESSMENT_NOT_FOUND,
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('quiz quá ngắn + chưa writing → 404 (không matching với bằng chứng yếu)', async () => {
    const { service, assessments } = makeService({
      quizRows: [quizRow({ item_count: 10 })],
    });
    assessments.latest.mockResolvedValue(null);

    await expect(service.matchFromProfile(47, {})).rejects.toMatchObject({
      code: ErrorCode.ASSESSMENT_NOT_FOUND,
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('quiz-only → target duy nhất là vocabulary với trọng số theo band quiz', async () => {
    const { service, assessments, matching } = makeService({
      quizRows: [quizRow({ band: 'A2' })],
    });
    assessments.latest.mockResolvedValue(null);

    await service.matchFromProfile(47, { limit: 5 });

    expect(matching.match).toHaveBeenCalledWith(
      { targets: [{ skillId: SKILLS.vocabulary, weight: 2.0 }], limit: 5 },
      { studentLevel: 'A2', requireLevelMatch: true },
    );
    expect(assessments.buildNeedFit).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          code: 'vocabulary',
          weight: 2.0,
          weightPct: 100,
        }),
      ],
      expect.anything(),
    );
  });

  it('có writing + quiz → giữ focus writing nhưng QUYỀT định lại trọng số vocabulary bằng band quiz', async () => {
    const { service, assessments, matching } = makeService({
      quizRows: [quizRow({ band: 'C1' })],
    });
    assessments.latest.mockResolvedValue(writingResponse());

    await service.matchFromProfile(47, {});

    const [payload, level] = matching.match.mock.calls[0];
    // band quiz C1 → vocabulary weight 0.5 (thay vì 1.5 từ free-text)
    expect(payload.targets).toEqual([
      { skillId: SKILLS.grammar, weight: 1.468 },
      { skillId: SKILLS.vocabulary, weight: 0.5 },
      { skillId: SKILLS.writing, weight: 1.0 },
    ]);
    // level filter vẫn lấy band writing (hành vi cũ giữ nguyên)
    expect(level).toEqual({
      studentLevel: 'A2',
      requireLevelMatch: true,
    });
    const focus = assessments.buildNeedFit.mock.calls[0][0];
    expect(focus.map((f: { code: string }) => f.code)).toEqual([
      'grammar',
      'vocabulary',
      'writing',
    ]);
    // 0.5 / (1.468 + 0.5 + 1.0) = 16.8%
    expect(focus[1].weightPct).toBeCloseTo(16.8, 1);
  });

  it('chỉ writing (không quiz) → trọng số vocabulary giữ nguyên như cũ', async () => {
    const { service, assessments, matching } = makeService();
    assessments.latest.mockResolvedValue(writingResponse());

    await service.matchFromProfile(47, {});

    const [payload] = matching.match.mock.calls[0];
    expect(payload.targets).toEqual([
      { skillId: SKILLS.grammar, weight: 1.468 },
      { skillId: SKILLS.vocabulary, weight: 1.5 },
      { skillId: SKILLS.writing, weight: 1.0 },
    ]);
  });

  it('requireLevelMatch = false được truyền xuống matching', async () => {
    const { service, assessments, matching } = makeService({
      quizRows: [quizRow({ band: 'B1' })],
    });
    assessments.latest.mockResolvedValue(null);

    await service.matchFromProfile(47, { requireLevelMatch: false });

    expect(matching.match).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ requireLevelMatch: false }),
    );
  });
});
