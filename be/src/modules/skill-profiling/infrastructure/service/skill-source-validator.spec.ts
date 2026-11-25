import { SkillSourceValidator } from './skill-source-validator';
import { SkillSourceType } from '../../domain/enum/skill-source-type.enum';

describe('SkillSourceValidator eligibility', () => {
  it('rejects a certificate that exists and is owned but is not verified', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ exists: 1 }])
      .mockResolvedValueOnce([{ source_updated_at: new Date() }])
      .mockResolvedValueOnce([]);
    const validator = new SkillSourceValidator({ query } as never);

    await expect(
      validator.resolve(SkillSourceType.CERTIFICATE, '10', 3),
    ).rejects.toBeDefined();
    expect(query.mock.calls[2][0]).toContain('certificate_status = 2');
  });

  it('rejects a draft lesson', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ exists: 1 }])
      .mockResolvedValueOnce([{ source_updated_at: new Date() }])
      .mockResolvedValueOnce([]);
    const validator = new SkillSourceValidator({ query } as never);

    await expect(
      validator.resolve(SkillSourceType.LESSON_PLAN, '11', 3),
    ).rejects.toBeDefined();
    expect(query.mock.calls[2][0]).toContain('status = 1');
  });

  it('accepts an eligible source after existence and ownership checks', async () => {
    const updated = new Date('2026-01-01T00:00:00Z');
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ exists: 1 }])
      .mockResolvedValueOnce([{ source_updated_at: updated }])
      .mockResolvedValueOnce([{ eligible: 1 }]);
    const validator = new SkillSourceValidator({ query } as never);

    await expect(
      validator.resolve(SkillSourceType.STUDENT_RATING, '12', 3),
    ).resolves.toEqual({ source_updated_at: String(updated) });
  });

  it('requires a completed enrollment for student outcome evidence', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ exists: 1 }])
      .mockResolvedValueOnce([{ source_updated_at: new Date() }])
      .mockResolvedValueOnce([]);
    const validator = new SkillSourceValidator({ query } as never);

    await expect(
      validator.resolve(SkillSourceType.STUDENT_OUTCOME, '13', 3),
    ).rejects.toBeDefined();
    expect(query.mock.calls[2][0]).toContain('progress = 100');
    expect(query.mock.calls[2][0]).toContain('completed_at IS NOT NULL');
  });
});
