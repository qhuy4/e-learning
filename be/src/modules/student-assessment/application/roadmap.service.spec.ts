import {
  roadmapReassessmentState,
  roadmapTransitions,
  RoadmapService,
} from './roadmap.service';
import type { DataSource } from 'typeorm';

describe('RoadmapService.generate', () => {
  type QueryHandler = (sql: string, params?: unknown[]) => unknown;

  function makeService(handler: QueryHandler) {
    const manager = {
      query: jest.fn((sql: string, params?: unknown[]) =>
        Promise.resolve(handler(sql, params)),
      ),
    };
    const dataSource = {
      transaction: (cb: (m: typeof manager) => unknown) => cb(manager),
    } as unknown as DataSource;
    const profiles = {
      getProfile: jest.fn().mockResolvedValue({
        levelBand: 'A1',
        levelSource: 'quiz',
        selfAssessment: null,
        skills: [],
      }),
    } as unknown as import('./learner-profile.service').LearnerProfileService;
    const assessmentRuns = {
      onEvidenceChangedForUser: jest.fn(),
    } as unknown as import('@/modules/skill-profiling/application/skill-assessment-run.service').SkillAssessmentRunService;
    return {
      service: new RoadmapService(dataSource, profiles, assessmentRuns),
      manager,
    };
  }

  /** Shape thật của TypeORM/Postgres driver cho UPDATE/SELECT ... RETURNING. */
  function baseHandler(overrides: QueryHandler = () => []): QueryHandler {
    return (sql, params) => {
      if (sql.includes('pg_advisory_xact_lock')) return undefined;
      if (sql.includes('INSERT INTO learning_roadmaps')) return [{ id: '77' }];
      if (sql.includes('WITH completed_stage'))
        return [{ has_completed_stage: false, has_fresh_assessment: false }];
      if (sql.includes('FROM learning_roadmaps r'))
        return [
          {
            id: '77',
            current_level: 'A1',
            target_level: 'B2',
            status: 'ACTIVE',
            revision: 1,
            profile_snapshot: {},
            created_at: new Date(),
            stage_id: null,
          },
        ];
      return overrides(sql, params);
    };
  }

  it('numbers the first revision 1 (UPDATE ... RETURNING yields [rows, count])', async () => {
    const { service, manager } = makeService(
      baseHandler((sql) => {
        if (sql.includes('UPDATE learning_roadmaps')) return [[], 0];
        return [];
      }),
    );
    const result = await service.generate(50);
    const insertCall = manager.query.mock.calls.find(([sql]) =>
      String(sql).includes('INSERT INTO learning_roadmaps'),
    );
    const insertParams = insertCall?.[1] as unknown[];
    expect(Number.isFinite(Number(insertParams?.[2]))).toBe(true);
    expect(insertParams?.[2]).toBe(1);
    expect(result).not.toBeNull();
  });

  it('increments revision from the superseded roadmap rows', async () => {
    const { service, manager } = makeService(
      baseHandler((sql) => {
        if (sql.includes('UPDATE learning_roadmaps'))
          return [[{ revision: 3 }], 1];
        return [];
      }),
    );
    await service.generate(50);
    const insertCall = manager.query.mock.calls.find(([sql]) =>
      String(sql).includes('INSERT INTO learning_roadmaps'),
    );
    expect(insertCall?.[1]?.[2]).toBe(4);
  });

  it('selects a course at each destination level for the A1 to B2 path', async () => {
    const courses = [
      {
        id: '101',
        instructor_id: '201',
        cefr_level_start: 'A1',
        cefr_level_end: 'A1',
        skill_codes: ['vocabulary'],
        price: 0,
      },
      {
        id: '102',
        instructor_id: '202',
        cefr_level_start: 'A2',
        cefr_level_end: 'A2',
        skill_codes: ['vocabulary'],
        price: 100000,
      },
      {
        id: '103',
        instructor_id: '203',
        cefr_level_start: 'B1',
        cefr_level_end: 'B1',
        skill_codes: ['vocabulary'],
        price: 150000,
      },
      {
        id: '104',
        instructor_id: '204',
        cefr_level_start: 'B2',
        cefr_level_end: 'B2',
        skill_codes: ['vocabulary'],
        price: 200000,
      },
    ];
    const { service, manager } = makeService(
      baseHandler((sql) => {
        if (sql.includes('UPDATE learning_roadmaps')) return [[], 0];
        if (sql.includes('FROM courses')) return courses;
        return [];
      }),
    );

    await service.generate(50);

    const stageCalls = manager.query.mock.calls.filter(([sql]) =>
      String(sql).includes('INSERT INTO learning_roadmap_stages'),
    );
    expect(stageCalls.map((call) => call[1]?.[4])).toEqual([102, 103, 104]);
  });

  it('does not create an empty roadmap after the learner reaches B2', async () => {
    const transaction = jest.fn();
    const dataSource = { transaction } as unknown as DataSource;
    const profiles = {
      getProfile: jest.fn().mockResolvedValue({
        levelBand: 'B2',
        levelSource: 'quiz',
        selfAssessment: null,
        skills: [],
      }),
    } as unknown as import('./learner-profile.service').LearnerProfileService;

    await expect(
      new RoadmapService(dataSource, profiles, {
        onEvidenceChangedForUser: jest.fn(),
      } as unknown as import('@/modules/skill-profiling/application/skill-assessment-run.service').SkillAssessmentRunService).generate(
        50,
      ),
    ).rejects.toThrow('Bạn đã đạt mục tiêu B2');
    expect(transaction).not.toHaveBeenCalled();
  });
});

describe('roadmapTransitions', () => {
  it('creates the complete A1 to B2 path', () => {
    expect(roadmapTransitions('A1')).toEqual([
      { from: 'A1', to: 'A2' },
      { from: 'A2', to: 'B1' },
      { from: 'B1', to: 'B2' },
    ]);
  });

  it('does not create backward stages after B2', () => {
    expect(roadmapTransitions('C1')).toEqual([]);
  });

  it('rebuilds a remedial path from the reassessed level', () => {
    expect(roadmapTransitions('A2')).toEqual([
      { from: 'A2', to: 'B1' },
      { from: 'B1', to: 'B2' },
    ]);
  });
});

describe('roadmapReassessmentState', () => {
  it.each([
    [false, false, 'LOCKED_STAGE'],
    [true, false, 'NEEDS_ASSESSMENT'],
    [true, true, 'READY'],
  ] as const)(
    'maps completed=%s and fresh=%s to %s',
    (completed, fresh, expected) => {
      expect(roadmapReassessmentState(completed, fresh)).toBe(expected);
    },
  );
});
