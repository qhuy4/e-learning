import { SkillAggregationService } from './skill-aggregation.service';
import { InstructorSkillEvidenceOrmEntity } from '@/modules/skill-profiling/infrastructure/entity/instructor-skill-evidence.orm-entity';
import { InstructorSkillProfileOrmEntity } from '@/modules/skill-profiling/infrastructure/entity/instructor-skill-profile.orm-entity';
import { SkillEvidenceStatus } from '@/modules/skill-profiling/domain/enum/skill-evidence-status.enum';
import { SkillSourceType } from '@/modules/skill-profiling/domain/enum/skill-source-type.enum';
import {
  SkillCapability,
  SkillVerification,
} from '@/modules/skill-profiling/domain/enum/skill-verification.enum';

const dayMs = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * dayMs);

type AnyEvidence = Partial<InstructorSkillEvidenceOrmEntity>;
type AnyProfile = Partial<InstructorSkillProfileOrmEntity>;

interface Stores {
  evidence: AnyEvidence[];
  profiles: AnyProfile[];
  /** dòng instructor_skills cho recompute (mặc định: LANGUAGE id 10). */
  skillRows?: Array<{ id: number; code: string; category: string }>;
}

function makeService(stores: Stores) {
  let idSeq = 100;
  const manager = {
    find: jest.fn(
      (entity: unknown, opts: { where: Record<string, unknown> }) => {
        if (entity === InstructorSkillEvidenceOrmEntity) {
          return stores.evidence.filter(
            (e) =>
              e.instructor_id === opts.where.instructor_id &&
              e.status === opts.where.status,
          );
        }
        if (entity === InstructorSkillProfileOrmEntity) {
          return stores.profiles.filter(
            (p) => p.instructor_id === opts.where.instructor_id,
          );
        }
        throw new Error('unexpected entity in find');
      },
    ),
    create: jest.fn((_entity: unknown, data: AnyProfile) => data),
    save: jest.fn((row: AnyProfile & AnyEvidence) => {
      if (row.id == null) row.id = ++idSeq;
      const store: unknown[] =
        'model_version' in row ? stores.profiles : stores.evidence;
      if (!store.includes(row)) store.push(row);
      return row;
    }),
    delete: jest.fn((_entity: unknown, criteria: { id: number }) => {
      stores.profiles = stores.profiles.filter((p) => p.id !== criteria.id);
    }),
    query: jest.fn((sql: string) => {
      if (sql.includes('pg_advisory_xact_lock')) return [];
      if (sql.includes('FROM instructor_skills')) {
        return (
          stores.skillRows ?? [
            { id: 10, code: 'grammar', category: 'LANGUAGE' },
          ]
        );
      }
      return [];
    }),
  };
  const dataSource = {
    transaction: jest.fn((cb: (m: typeof manager) => unknown) => cb(manager)),
  };
  const service = new SkillAggregationService(dataSource as never);
  return { service, manager, dataSource };
}

function ev(over: AnyEvidence = {}): AnyEvidence {
  return {
    id: undefined,
    instructor_id: 1,
    skill_id: 10,
    source_type: SkillSourceType.STUDENT_RATING,
    source_id: '1',
    score: 0.8,
    weight: 0.85, // stored snapshot of config base weight for STUDENT_RATING
    confidence: 0.9,
    observed_at: daysAgo(0),
    extractor_version: 'v2',
    status: SkillEvidenceStatus.ACTIVE,
    verification: SkillVerification.INFERRED,
    capability: SkillCapability.TEACHING,
    metadata: null,
    created_at: new Date(),
    ...over,
  };
}

describe('SkillAggregationService.recompute', () => {
  it('sparse evidence: preserves raw weighted score with low confidence', async () => {
    const stores: Stores = {
      evidence: [ev({ score: 0.9, confidence: 0.8 })],
      profiles: [],
    };
    const { service } = makeService(stores);

    const results = await service.recompute(1);

    expect(results).toHaveLength(1);
    expect(results[0].evidence_count).toBe(1);
    expect(results[0].confidence).toBeLessThan(0.6);
    expect(results[0].score).toBeCloseTo(0.9, 6);
    expect(stores.profiles).toHaveLength(1);
  });

  it('abundant evidence: high confidence, score close to raw weighted average', async () => {
    const stores: Stores = {
      evidence: [
        ...Array.from({ length: 10 }, (_, i) =>
          ev({
            source_type: SkillSourceType.STUDENT_RATING,
            source_id: `rating-${i}`,
            metadata: { independence_key: `review-student:${i}` },
            weight: 0.85,
            score: 0.8,
            confidence: 0.95,
          }),
        ),
      ],
      profiles: [],
    };
    const { service } = makeService(stores);

    const results = await service.recompute(1);

    expect(results[0].evidence_count).toBe(10);
    expect(results[0].confidence).toBeGreaterThan(0.7);
    expect(Math.abs(results[0].score - 0.8)).toBeLessThan(0.03);
  });

  it('time decay: old evidence pulls less than fresh evidence', async () => {
    // fresh 0.9 + fresh 0.5
    const freshBoth: Stores = {
      evidence: [ev({ score: 0.9 }), ev({ score: 0.5, source_id: '2' })],
      profiles: [],
    };
    // fresh 0.9 + 540d-old 0.5  (decay = 0.5^3 = 0.125)
    const oldLow: Stores = {
      evidence: [
        ev({ score: 0.9 }),
        ev({ score: 0.5, source_id: '2', observed_at: daysAgo(540) }),
      ],
      profiles: [],
    };
    // 540d-old 0.9 + fresh 0.5
    const oldHigh: Stores = {
      evidence: [
        ev({ score: 0.9, observed_at: daysAgo(540) }),
        ev({ score: 0.5, source_id: '2' }),
      ],
      profiles: [],
    };

    const [a, b, c] = await Promise.all([
      makeService(freshBoth).service.recompute(1),
      makeService(oldLow).service.recompute(1),
      makeService(oldHigh).service.recompute(1),
    ]);

    // stale low score drags less (b higher than a); stale high score helps less (c lowest)
    expect(b[0].score).toBeGreaterThan(a[0].score);
    expect(a[0].score).toBeGreaterThan(c[0].score);
    expect(c[0].score).toBeLessThan(0.6);
  });

  it('time decay: confidence drops with stale evidence (consistent with shrinking weight)', async () => {
    const fresh: Stores = { evidence: [ev({ score: 0.9 })], profiles: [] };
    const stale: Stores = {
      evidence: [ev({ score: 0.9, observed_at: daysAgo(180) })],
      profiles: [],
    };

    const [f, s] = await Promise.all([
      makeService(fresh).service.recompute(1),
      makeService(stale).service.recompute(1),
    ]);

    expect(s[0].confidence).toBeLessThan(f[0].confidence);
    expect(s[0].score).toBeCloseTo(f[0].score!, 6);
  });

  it('conflicting evidence lands at the deterministic weighted mean', async () => {
    const stores: Stores = {
      evidence: [
        ev({ score: 0.1, source_id: '1' }),
        ev({ score: 0.1, source_id: '2' }),
        ev({ score: 0.9, source_id: '3' }),
      ],
      profiles: [],
    };
    const { service } = makeService(stores);

    const results = await service.recompute(1);

    const raw = (0.1 + 0.1 + 0.9) / 3; // equal weights => 0.3667
    expect(results[0].score).toBeCloseTo(raw, 6);
    expect(results[0].score).toBeGreaterThan(0.1);
    expect(results[0].score).toBeLessThan(0.9);
  });

  it('idempotent: two recomputes produce identical profiles, single row', async () => {
    // Freeze time: decay depends on Date.now(), and two runs crossing a
    // millisecond boundary would produce sub-nanoscale float drift.
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-01-15T00:00:00Z'));
    const stores: Stores = {
      evidence: [ev({ score: 0.7 }), ev({ score: 0.6, source_id: '2' })],
      profiles: [],
    };
    const { service } = makeService(stores);

    try {
      const first = await service.recompute(1);
      const second = await service.recompute(1);

      expect(second).toEqual(first);
      expect(stores.profiles).toHaveLength(1);
      expect(stores.profiles[0].model_version).toBe('heuristic-mvp-v2');
      expect(stores.profiles[0].model_kind).toBe('heuristic');
      expect(stores.evidence).toHaveLength(2); // recompute never touches evidence
      expect(
        stores.evidence.every((e) => e.status === SkillEvidenceStatus.ACTIVE),
      ).toBe(true);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('no evidence: creates nothing and deletes stale profile rows (unknown, not 0)', async () => {
    const stores: Stores = {
      evidence: [],
      profiles: [
        {
          id: 1,
          instructor_id: 1,
          skill_id: 10,
          score: 0.9,
          confidence: 0.9,
          evidence_count: 3,
          model_version: 'v1',
          computed_at: new Date(),
        },
      ],
    };
    const { service } = makeService(stores);

    const results = await service.recompute(1);

    expect(results).toHaveLength(0);
    expect(stores.profiles).toHaveLength(0);
  });

  it('uses the stored weight (config snapshot), not the live config', async () => {
    // Same source_type but stored weights 0.2 / 0.8 (config says 0.85):
    // the higher-weight evidence must dominate the outcome.
    const stores: Stores = {
      evidence: [
        ev({ score: 0.2, weight: 0.2, source_id: '1' }),
        ev({ score: 0.9, weight: 0.8, source_id: '2' }),
      ],
      profiles: [],
    };
    const { service } = makeService(stores);

    const results = await service.recompute(1);

    // stored-weight raw average is 0.76; live-config (equal 0.85) would be 0.55.
    expect(results[0].score).toBeCloseTo(0.76, 6);
  });

  it('repeated reviews from one student cannot inflate confidence', async () => {
    const volume: Stores = {
      evidence: Array.from({ length: 17 }, (_, i) =>
        ev({
          source_type: SkillSourceType.STUDENT_RATING,
          source_id: String(100 + i),
          metadata: { independence_key: 'review-student:7' },
          weight: 0.85,
          score: 0.8,
          confidence: 0.95,
        }),
      ),
      profiles: [],
    };
    const single: Stores = {
      evidence: [
        ev({
          source_id: '200',
          metadata: { independence_key: 'review-student:7' },
          score: 0.8,
          confidence: 0.95,
        }),
      ],
      profiles: [],
    };
    const independent: Stores = {
      evidence: Array.from({ length: 3 }, (_, i) =>
        ev({
          source_id: String(200 + i),
          metadata: { independence_key: `review-student:${i + 1}` },
          score: 0.8,
          confidence: 0.95,
        }),
      ),
      profiles: [],
    };

    const [v, s, d] = await Promise.all([
      makeService(volume).service.recompute(1),
      makeService(single).service.recompute(1),
      makeService(independent).service.recompute(1),
    ]);

    expect(v[0].evidence_count).toBe(17);
    expect(v[0].confidence).toBeCloseTo(s[0].confidence!, 6);
    // Three independent students beat seventeen records from one student.
    expect(d[0].confidence).toBeGreaterThan(v[0].confidence);
  });

  it('reviews from one student count as one independent evidence unit', async () => {
    const correlated = await makeService({
      evidence: Array.from({ length: 5 }, (_, i) =>
        ev({
          source_id: String(i + 1),
          metadata: { independence_key: 'review-student:42' },
        }),
      ),
      profiles: [],
    }).service.recompute(1);
    const independent = await makeService({
      evidence: Array.from({ length: 5 }, (_, i) =>
        ev({
          source_id: String(i + 1),
          metadata: { independence_key: `review-student:${i + 1}` },
        }),
      ),
      profiles: [],
    }).service.recompute(1);

    expect(correlated[0].independent_evidence_count).toBe(1);
    expect(independent[0].independent_evidence_count).toBe(5);
    expect(correlated[0].confidence).toBeLessThan(independent[0].confidence);
  });

  it('aggregates IELTS and TOEIC deterministically and penalizes disagreement', async () => {
    const certificate = (id: string, score: number) =>
      ev({
        source_type: SkillSourceType.CERTIFICATE,
        source_id: id,
        metadata: { independence_key: `certificate:${id}` },
        score,
        weight: 0.5,
        confidence: 0.9,
        verification: SkillVerification.VERIFIED,
      });
    const consistent = [
      certificate('ielts', 1),
      certificate('toeic', 455 / 495),
    ];
    const conflicting = [certificate('ielts', 1), certificate('toeic', 0.2)];

    const [forward, reverse, conflict] = await Promise.all([
      makeService({ evidence: consistent, profiles: [] }).service.recompute(1),
      makeService({
        evidence: [...consistent].reverse(),
        profiles: [],
      }).service.recompute(1),
      makeService({ evidence: conflicting, profiles: [] }).service.recompute(1),
    ]);

    expect(forward[0].score).toBeCloseTo(reverse[0].score!, 12);
    expect(forward[0].confidence).toBeCloseTo(reverse[0].confidence!, 10);
    expect(forward[0].assessment_status).toBe(reverse[0].assessment_status);
    expect(forward[0].score).toBeCloseTo((1 + 455 / 495) / 2, 6);
    expect(forward[0].confidence).toBeGreaterThan(conflict[0].confidence!);
  });

  it('a lower independent certificate can lower the aggregate score', async () => {
    const high = ev({
      source_type: SkillSourceType.CERTIFICATE,
      source_id: 'ielts',
      metadata: { independence_key: 'certificate:ielts' },
      score: 1,
      weight: 0.5,
      confidence: 0.9,
      verification: SkillVerification.VERIFIED,
    });
    const lower = ev({
      ...high,
      source_id: 'toeic',
      metadata: { independence_key: 'certificate:toeic' },
      score: 0.8,
    });
    const [one, two] = await Promise.all([
      makeService({ evidence: [high], profiles: [] }).service.recompute(1),
      makeService({ evidence: [high, lower], profiles: [] }).service.recompute(
        1,
      ),
    ]);
    expect(two[0].score).toBeLessThan(one[0].score!);
    expect(two[0].confidence).toBeGreaterThan(one[0].confidence!);
  });

  it('duplicate uploads of one credential do not inflate score or confidence', async () => {
    const credential = (sourceId: string) =>
      ev({
        source_type: SkillSourceType.CERTIFICATE,
        source_id: sourceId,
        metadata: {
          independence_key:
            'certificate-credential:IELTS_TRF:report:ABC123:date:2026-01-01',
        },
        score: 8.5 / 9,
        weight: 0.5,
        confidence: 0.9,
        verification: SkillVerification.VERIFIED,
      });
    const [one, duplicate] = await Promise.all([
      makeService({
        evidence: [credential('1')],
        profiles: [],
      }).service.recompute(1),
      makeService({
        evidence: [credential('1'), credential('2')],
        profiles: [],
      }).service.recompute(1),
    ]);

    expect(duplicate[0].score).toBeCloseTo(one[0].score!, 6);
    expect(duplicate[0].confidence).toBeCloseTo(one[0].confidence!, 6);
    expect(duplicate[0].independent_evidence_count).toBe(1);
  });

  it('teaching competency is provisional with one eligible review', async () => {
    const result = await makeService({
      evidence: [ev()],
      profiles: [],
      skillRows: [
        { id: 10, code: 'instructional_clarity', category: 'PEDAGOGY' },
      ],
    }).service.recompute(1);

    expect(result[0].assessment_status).toBe('PROVISIONAL');
    expect(result[0].score).not.toBeNull();
  });

  it('disabled self-report sources do not contribute at runtime', async () => {
    const evidence = [
      ...Array.from({ length: 10 }, () =>
        ev({
          source_type: SkillSourceType.SELF_ASSESSMENT,
          source_id: null,
          weight: 0.15,
          score: 0.8,
          confidence: 0.95,
        }),
      ),
      ...Array.from({ length: 10 }, () =>
        ev({
          source_type: SkillSourceType.EXPERIENCE,
          source_id: null,
          weight: 0.25,
          score: 0.8,
          confidence: 0.95,
        }),
      ),
    ];
    const { service } = makeService({ evidence, profiles: [] });

    const results = await service.recompute(1);

    expect(results).toEqual([]);
  });

  it('DECLARED evidence is excluded from score, count and verified_ratio', async () => {
    const base = {
      source_type: SkillSourceType.STUDENT_RATING,
      score: 0.9,
      confidence: 0.95,
      weight: 0.85,
    };
    const [withoutDeclared, withDeclared] = await Promise.all([
      makeService({ evidence: [ev(base)], profiles: [] }).service.recompute(1),
      makeService({
        evidence: [
          ev(base),
          ev({
            ...base,
            source_type: SkillSourceType.SELF_ASSESSMENT,
            source_id: null,
            score: 0.1,
            weight: 0,
            verification: SkillVerification.DECLARED,
          }),
        ],
        profiles: [],
      }).service.recompute(1),
    ]);

    expect(withDeclared[0].evidence_count).toBe(1);
    expect(withDeclared[0].score).toBeCloseTo(withoutDeclared[0].score, 6);
    expect(withDeclared[0].confidence).toBeCloseTo(
      withoutDeclared[0].confidence,
      6,
    );
  });

  it('a skill with only DECLARED evidence produces no profile row (unknown, not 0)', async () => {
    const stores: Stores = {
      evidence: [
        ev({
          source_type: SkillSourceType.SELF_ASSESSMENT,
          source_id: null,
          weight: 0,
          verification: SkillVerification.DECLARED,
        }),
      ],
      profiles: [],
    };
    const results = await makeService(stores).service.recompute(1);
    expect(results).toEqual([]);
    expect(stores.profiles).toEqual([]);
  });

  it('verified_ratio is the weighted share of VERIFIED evidence', async () => {
    const stores: Stores = {
      evidence: [
        ev({
          source_type: SkillSourceType.CERTIFICATE,
          source_id: '1',
          score: 0.8,
          weight: 0.5,
          confidence: 1,
          verification: SkillVerification.VERIFIED,
        }),
        ev({
          source_type: SkillSourceType.STUDENT_RATING,
          source_id: '2',
          score: 0.8,
          weight: 0.425,
          confidence: 1,
          verification: SkillVerification.INFERRED,
        }),
      ],
      profiles: [],
    };
    const results = await makeService(stores).service.recompute(1);
    expect(results[0].verified_ratio).toBeCloseTo(0.5 / 0.925, 6);
    expect(stores.profiles[0].verified_ratio).toBeCloseTo(0.5 / 0.925, 6);
  });

  it('verified_ratio is 1 when all evidence is VERIFIED and 0 when none is', async () => {
    const verified = await makeService({
      evidence: [
        ev({
          source_type: SkillSourceType.CERTIFICATE,
          source_id: '1',
          weight: 0.5,
          verification: SkillVerification.VERIFIED,
        }),
      ],
      profiles: [],
    }).service.recompute(1);
    const inferred = await makeService({
      evidence: [ev({ weight: 0.425 })],
      profiles: [],
    }).service.recompute(1);

    expect(verified[0].verified_ratio).toBe(1);
    expect(inferred[0].verified_ratio).toBe(0);
  });

  it('model blend is gone: profiles identify the deterministic heuristic', async () => {
    const stores: Stores = {
      evidence: [ev({ score: 0.8, confidence: 0.95 })],
      profiles: [],
    };
    const results = await makeService(stores).service.recompute(1);

    expect(results).toHaveLength(1);
    expect(stores.profiles[0].model_kind).toBe('heuristic');
    expect(stores.profiles[0].model_version).toBe('heuristic-mvp-v2');
    expect(stores.profiles[0].score_model).toBeNull();
  });
});

describe('SkillAggregationService.topInstructorsForSkill', () => {
  it('queries with confidence threshold, orders by score and limits', async () => {
    const query = jest.fn(() => [
      {
        instructor_id: '3',
        score: '0.910',
        confidence: '0.800',
        evidence_count: 7,
      },
      {
        instructor_id: '1',
        score: '0.750',
        confidence: '0.650',
        evidence_count: 4,
      },
    ]);
    const dataSource = { query, transaction: jest.fn() };
    const service = new SkillAggregationService(dataSource as never);

    const rows = await service.topInstructorsForSkill(10, 5, 0.6);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('confidence >= $2'),
      [10, 0.6, 5],
    );
    expect(rows).toEqual([
      { instructor_id: 3, score: 0.91, confidence: 0.8, evidence_count: 7 },
      { instructor_id: 1, score: 0.75, confidence: 0.65, evidence_count: 4 },
    ]);
  });
});
