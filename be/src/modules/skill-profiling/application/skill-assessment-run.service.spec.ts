import { SkillAssessmentRunService } from './skill-assessment-run.service';

function harness(options?: { newerRun?: boolean; aggregateError?: Error }) {
  const runner = {
    connect: jest.fn(),
    release: jest.fn(),
    query: jest.fn((sql: string) => {
      if (sql.includes('SELECT id FROM skill_assessment_runs'))
        return options?.newerRun ? [{ id: 2 }] : [];
      if (sql.includes('SELECT processing_status'))
        return [{ processing_status: 'SUCCEEDED' }];
      return [];
    }),
  };
  const dataSource = {
    query: jest.fn(() => [{ id: 1 }]),
    createQueryRunner: jest.fn(() => runner),
  };
  const extractor = {
    refreshForInstructor: jest.fn(() => ({
      created: 1,
      superseded: 0,
      kept: 0,
    })),
  };
  const aggregation = {
    recompute: options?.aggregateError
      ? jest.fn(() => Promise.reject(options.aggregateError))
      : jest.fn(() => []),
  };
  const service = new SkillAssessmentRunService(
    dataSource as never,
    extractor as never,
    aggregation as never,
  );
  return { service, runner, dataSource, extractor, aggregation };
}

describe('SkillAssessmentRunService', () => {
  it('supersedes a stale run before extraction after it acquires the lock', async () => {
    const h = harness({ newerRun: true });

    await expect(h.service.execute(7, 'MANUAL')).resolves.toEqual({
      runId: 1,
      status: 'SUPERSEDED',
    });
    expect(h.extractor.refreshForInstructor).not.toHaveBeenCalled();
    expect(h.aggregation.recompute).not.toHaveBeenCalled();
  });

  it('passes the run id into the atomic aggregation transaction', async () => {
    const h = harness();

    const result = await h.service.execute(7, 'EVIDENCE_CHANGED');

    expect(h.aggregation.recompute).toHaveBeenCalledWith(7, 1);
    expect(result.status).toBe('SUCCEEDED');
    expect(h.runner.release).toHaveBeenCalled();
  });

  it('resolves user and course mutations through the same protected run', async () => {
    const byUser = harness();
    const byCourse = harness();

    await byUser.service.executeForUser(12, 'EVIDENCE_CHANGED');
    await byCourse.service.executeForCourse(44, 'EVIDENCE_CHANGED');

    expect(byUser.aggregation.recompute).toHaveBeenCalledWith(1, 1);
    expect(byCourse.aggregation.recompute).toHaveBeenCalledWith(1, 1);
    expect(byUser.dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM instructor_profiles'),
      [12],
    );
    expect(byCourse.dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM courses c'),
      [44],
    );
  });

  it('records failure and never reports a failed run as successful', async () => {
    const h = harness({ aggregateError: new Error('aggregation failed') });

    await expect(h.service.execute(7, 'SCHEDULED')).rejects.toThrow(
      'aggregation failed',
    );
    expect(h.runner.query).toHaveBeenCalledWith(
      expect.stringContaining("processing_status = 'FAILED'"),
      [1, 'aggregation failed'],
    );
  });
});
