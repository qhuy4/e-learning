import { HttpStatus } from '@nestjs/common';
import {
  SkillEvidenceService,
  RecordEvidenceInput,
} from './skill-evidence.service';
import { SKILL_AGGREGATION_CONFIG } from './skill-aggregation.config';
import { InstructorSkillEvidenceOrmEntity } from '@/modules/skill-profiling/infrastructure/entity/instructor-skill-evidence.orm-entity';
import { SkillEvidenceStatus } from '@/modules/skill-profiling/domain/enum/skill-evidence-status.enum';
import { SkillSourceType } from '@/modules/skill-profiling/domain/enum/skill-source-type.enum';
import {
  SkillVerification,
  VERIFICATION_WEIGHT,
} from '@/modules/skill-profiling/domain/enum/skill-verification.enum';
import { SkillCatalogRepository } from '@/modules/skill-profiling/infrastructure/repository/skill-catalog.repository';
import { SkillSourceValidator } from '@/modules/skill-profiling/infrastructure/service/skill-source-validator';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

type AnyEvidence = Partial<InstructorSkillEvidenceOrmEntity> & { id?: number };

function makeService(options?: {
  skillExists?: boolean;
  rejectWith?: unknown;
  throw23505?: boolean;
}) {
  const store: AnyEvidence[] = [];
  let idSeq = 0;

  const manager = {
    query: jest.fn(() => []),
    getRepository: jest.fn(() => ({
      find: (opts: { where: Record<string, unknown> }) => {
        const w = opts.where;
        return store.filter((e) => {
          if (e.instructor_id !== w.instructor_id) return false;
          if (e.skill_id !== w.skill_id) return false;
          if (e.source_type !== w.source_type) return false;
          if (e.status !== w.status) return false;
          const whereSourceId = w.source_id;
          const wantNull =
            whereSourceId == null || typeof whereSourceId === 'object';
          return wantNull ? e.source_id == null : e.source_id === whereSourceId;
        });
      },
      create: (data: AnyEvidence) => data,
      save: (row: AnyEvidence) => {
        if (row.id == null) row.id = ++idSeq;
        if (!store.includes(row)) store.push(row);
        return row;
      },
    })),
  };

  const dataSource = options?.throw23505
    ? {
        transaction: jest
          .fn()
          .mockRejectedValue(
            Object.assign(
              new Error('duplicate key value violates unique constraint'),
              { code: '23505' },
            ),
          ),
      }
    : {
        transaction: jest.fn((cb: (m: typeof manager) => unknown) =>
          cb(manager),
        ),
      };

  const skillCatalog = {
    findActiveById: jest.fn(() =>
      options?.skillExists === false
        ? null
        : { id: 10, code: 'grammar_teaching', is_active: true },
    ),
  } as unknown as SkillCatalogRepository;

  const sourceValidator = options?.rejectWith
    ? { resolve: jest.fn().mockRejectedValue(options.rejectWith) }
    : {
        resolve: jest.fn(() => ({
          source_updated_at: '2026-01-02 03:04:05',
        })),
      };

  const service = new SkillEvidenceService(
    dataSource as never,
    skillCatalog,
    sourceValidator as unknown as SkillSourceValidator,
  );

  return {
    service,
    store,
    manager,
    dataSource,
    skillCatalog,
    resolve: sourceValidator.resolve,
  };
}

function input(over: Partial<RecordEvidenceInput> = {}): RecordEvidenceInput {
  return {
    instructor_id: 1,
    skill_id: 10,
    source_type: SkillSourceType.STUDENT_RATING,
    source_id: '42',
    score: 0.8,
    confidence: 0.9,
    observed_at: new Date('2026-09-01T00:00:00.000Z'),
    rationale: 'student review 5 stars',
    ...over,
  };
}

describe('SkillEvidenceService.recordEvidence', () => {
  it('rejects score/confidence outside 0..1', async () => {
    const { service } = makeService();
    await expect(
      service.recordEvidence(input({ score: 1.5 })),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
    });
    await expect(
      service.recordEvidence(input({ confidence: -0.1 })),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
    });
  });

  it('rejects unknown or inactive skill with SKILL_NOT_FOUND', async () => {
    const { service } = makeService({ skillExists: false });
    await expect(service.recordEvidence(input())).rejects.toMatchObject({
      code: ErrorCode.SKILL_NOT_FOUND,
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('SELF_ASSESSMENT must have source_id NULL and skips source validation', async () => {
    const { service, resolve } = makeService();
    await expect(
      service.recordEvidence(
        input({ source_type: SkillSourceType.SELF_ASSESSMENT, source_id: '1' }),
      ),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_ERROR });

    const result = await service.recordEvidence(
      input({ source_type: SkillSourceType.SELF_ASSESSMENT, source_id: null }),
    );
    expect(result.created).toBe(true);
    expect(resolve).not.toHaveBeenCalled();
  });

  it('typed sources require source_id', async () => {
    const { service } = makeService();
    await expect(
      service.recordEvidence(input({ source_id: null })),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
    });
  });

  it('propagates 404 when the source does not exist', async () => {
    const { service } = makeService({
      rejectWith: new AppException(
        ErrorCode.SKILL_EVIDENCE_SOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      ),
    });
    await expect(service.recordEvidence(input())).rejects.toMatchObject({
      code: ErrorCode.SKILL_EVIDENCE_SOURCE_NOT_FOUND,
    });
  });

  it('propagates 403 when the source belongs to another instructor', async () => {
    const { service } = makeService({
      rejectWith: new AppException(
        ErrorCode.INVALID_PERMISSION,
        HttpStatus.FORBIDDEN,
      ),
    });
    await expect(service.recordEvidence(input())).rejects.toMatchObject({
      code: ErrorCode.INVALID_PERMISSION,
    });
  });

  it('creates ACTIVE evidence with weight snapshot, content hash and advisory lock', async () => {
    const { service, store, manager, dataSource } = makeService();

    const result = await service.recordEvidence(input());

    expect(result.created).toBe(true);
    expect(store).toHaveLength(1);
    const row = store[0];
    expect(row.status).toBe(SkillEvidenceStatus.ACTIVE);
    expect(row.weight).toBeCloseTo(
      SKILL_AGGREGATION_CONFIG.baseWeights[
        SkillSourceType.STUDENT_RATING
      ] * VERIFICATION_WEIGHT[SkillVerification.INFERRED],
      6,
    );
    expect(row.verification).toBe(SkillVerification.INFERRED);
    expect(row.extractor_version).toBe(
      SKILL_AGGREGATION_CONFIG.extractorVersion,
    );
    expect(row.metadata?.content_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(row.metadata?.rationale).toBe('student review 5 stars');
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(manager.query).toHaveBeenCalledWith(
      'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
      ['1:10:STUDENT_RATING:42'],
    );
  });

  it('is idempotent: identical re-insert is a no-op', async () => {
    const { service, store } = makeService();

    const first = await service.recordEvidence(input());
    const second = await service.recordEvidence(input());

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.evidence?.id).toBe(first.evidence?.id);
    expect(store).toHaveLength(1);
    expect(store[0].status).toBe(SkillEvidenceStatus.ACTIVE);
  });

  it('supersedes the old row on changed content (same extractor_version)', async () => {
    const { service, store } = makeService();

    await service.recordEvidence(input());
    const result = await service.recordEvidence(input({ score: 0.4 }));

    expect(result.created).toBe(true);
    expect(store).toHaveLength(2);
    const [oldRow, newRow] = store;
    expect(oldRow.status).toBe(SkillEvidenceStatus.SUPERSEDED);
    expect(oldRow.score).toBe(0.8); // data columns untouched, status flip only
    expect(newRow.status).toBe(SkillEvidenceStatus.ACTIVE);
    expect(newRow.score).toBe(0.4);
    expect(newRow.metadata?.content_hash).not.toBe(
      oldRow.metadata?.content_hash,
    );
  });

  it('supersedes across extractor versions (same source, new version)', async () => {
    const { service, store } = makeService();

    await service.recordEvidence(input());
    const result = await service.recordEvidence(
      input({ extractor_version: 'v3' }),
    );

    expect(result.created).toBe(true);
    expect(store).toHaveLength(2);
    expect(store[0].status).toBe(SkillEvidenceStatus.SUPERSEDED);
    expect(store[1].extractor_version).toBe('v3');
    expect(store[1].status).toBe(SkillEvidenceStatus.ACTIVE);
  });

  it('self-assessment defaults to DECLARED with zero weight', async () => {
    const { service, store } = makeService();

    await service.recordEvidence(
      input({
        source_type: SkillSourceType.SELF_ASSESSMENT,
        source_id: null,
      }),
    );

    expect(store[0].verification).toBe(SkillVerification.DECLARED);
    expect(store[0].weight).toBe(0);
  });

  it('explicit VERIFIED snapshots the full tier weight', async () => {
    const { service, store } = makeService();

    await service.recordEvidence(
      input({ verification: SkillVerification.VERIFIED }),
    );

    expect(store[0].verification).toBe(SkillVerification.VERIFIED);
    expect(store[0].weight).toBeCloseTo(
      SKILL_AGGREGATION_CONFIG.baseWeights[SkillSourceType.STUDENT_RATING],
      6,
    );
  });

  it('treats a concurrent unique violation (23505) as a no-op', async () => {
    const { service } = makeService({ throw23505: true });

    const result = await service.recordEvidence(input());

    expect(result).toEqual({ created: false });
  });
});
