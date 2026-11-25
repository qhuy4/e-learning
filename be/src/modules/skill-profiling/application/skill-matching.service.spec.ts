import { BadRequestException } from '@nestjs/common';
import { SkillMatchingService } from './skill-matching.service';
import { SkillSourceType } from '@/modules/skill-profiling/domain/enum/skill-source-type.enum';
import { ApprovalStatus } from '@/modules/instructors/domain/enum/instructor-profile.status';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { UserStatus } from '@/modules/users/domain/enum/user.status';
import { SkillCategory } from '@/modules/skill-profiling/domain/enum/skill-category.enum';

interface EligibleRow {
  id: string | number;
  user_id?: string | number;
  name: string;
  headline: string | null;
  total_students: number;
  avg_rating: number | null;
  teaching_levels?: string | null;
  hourly_rate?: number;
}

interface ProfileRow {
  instructor_id: string | number;
  skill_id: string | number;
  score: number;
  confidence: number;
  evidence_count: number;
  verified_ratio?: number;
}

interface EvRow {
  instructor_id: string | number;
  skill_id: string | number;
  source_type: SkillSourceType;
  cnt: number;
}

const SKILLS: Record<
  number,
  { id: number; code: string; name: string; category: SkillCategory }
> = {
  10: {
    id: 10,
    code: 'grammar',
    name: 'Grammar',
    category: SkillCategory.LANGUAGE,
  },
  11: {
    id: 11,
    code: 'vocabulary',
    name: 'Vocabulary',
    category: SkillCategory.LANGUAGE,
  },
  12: {
    id: 12,
    code: 'pronunciation',
    name: 'Pronunciation',
    category: SkillCategory.LANGUAGE,
  },
  20: {
    id: 20,
    code: 'ielts',
    name: 'IELTS',
    category: SkillCategory.EXAM,
  },
};

function makeService(opts: {
  eligible: EligibleRow[];
  profiles?: ProfileRow[];
  evidenceCounts?: EvRow[];
  inactive?: number[];
}) {
  const query = jest.fn((sql: string) => {
    if (sql.includes('FROM instructor_profiles')) return opts.eligible;
    if (sql.includes('FROM instructor_skill_profiles'))
      return opts.profiles ?? [];
    if (sql.includes('FROM instructor_skill_evidences'))
      return opts.evidenceCounts ?? [];
    if (sql.includes('FROM instructor_skills'))
      return Object.values(SKILLS).filter(
        (skill) => skill.category === SkillCategory.LANGUAGE,
      );
    return [];
  });
  const catalog = {
    findActiveById: jest.fn((id: number) =>
      Promise.resolve(
        opts.inactive?.includes(id)
          ? null
          : SKILLS[id]
            ? { ...SKILLS[id], is_active: true }
            : null,
      ),
    ),
  };
  const service = new SkillMatchingService(
    { query } as never,
    catalog as never,
  );
  return { service, query, catalog };
}

const ann: EligibleRow = {
  id: '1',
  name: 'Ann',
  headline: 'Giảng viên ngữ pháp',
  total_students: 10,
  avg_rating: 4.5,
};
const bob: EligibleRow = {
  id: '2',
  name: 'Bob',
  headline: null,
  total_students: 3,
  avg_rating: 4.0,
};

describe('SkillMatchingService.match', () => {
  it('trả users.id cho URL booking nhưng vẫn đọc skill bằng profile id', async () => {
    const { service } = makeService({
      eligible: [{ ...ann, id: 21, user_id: 53 }],
      profiles: [
        {
          instructor_id: 21,
          skill_id: 10,
          score: 0.8,
          confidence: 0.7,
          evidence_count: 1,
        },
      ],
    });

    const res = await service.match({ targets: [{ skillId: 10 }] });

    expect(res.ranked[0].instructor.id).toBe(53);
  });

  it('ranking: coverage-aware matchScore is the primary order', async () => {
    const { service } = makeService({
      eligible: [ann, bob],
      profiles: [
        {
          instructor_id: 1,
          skill_id: 10,
          score: 0.9,
          confidence: 0.5,
          evidence_count: 5,
        },
        {
          instructor_id: 2,
          skill_id: 10,
          score: 0.7,
          confidence: 0.5,
          evidence_count: 5,
        },
      ],
    });

    const res = await service.match({ targets: [{ skillId: 10 }] });

    expect(res.ranked.map((r) => r.instructor.id)).toEqual([1, 2]);
    expect(res.ranked[0].fit).toBeCloseTo(0.7, 6);
    expect(res.ranked[0].matchScore).toBeCloseTo(0.7, 6);
    expect(res.ranked[1].fit).toBeCloseTo(0.6, 6);
    expect(res.meta).toEqual({
      eligible: 2,
      rankedCount: 2,
      insufficientCount: 0,
    });
  });

  it('weights: target weights không bằng nhau làm thay đổi fit', async () => {
    const { service } = makeService({
      eligible: [ann, bob],
      profiles: [
        {
          instructor_id: 1,
          skill_id: 10,
          score: 0.5,
          confidence: 0.5,
          evidence_count: 2,
        },
        {
          instructor_id: 1,
          skill_id: 11,
          score: 0.5,
          confidence: 0.5,
          evidence_count: 2,
        },
        {
          instructor_id: 2,
          skill_id: 10,
          score: 0.4,
          confidence: 0.5,
          evidence_count: 2,
        },
        {
          instructor_id: 2,
          skill_id: 11,
          score: 0.9,
          confidence: 0.5,
          evidence_count: 2,
        },
      ],
    });

    const res = await service.match({
      targets: [
        { skillId: 10, weight: 3 },
        { skillId: 11, weight: 1 },
      ],
    });

    // Ann: (3·0.5 + 1·0.5)/4 = 0.5; Bob: (3·0.4 + 1·0.9)/4 = 0.525
    expect(res.ranked[0].instructor.id).toBe(2);
    expect(res.ranked[0].fit).toBeCloseTo(0.5125, 6);
    expect(res.ranked[1].fit).toBeCloseTo(0.5, 6);
    // targets chuẩn hóa trong response
    expect(res.targets.map((t) => t.weight)).toEqual([0.75, 0.25]);
  });

  it('default weight = 1 cho target thiếu weight (equal weights)', async () => {
    const { service } = makeService({
      eligible: [ann],
      profiles: [
        {
          instructor_id: 1,
          skill_id: 10,
          score: 0.6,
          confidence: 0.5,
          evidence_count: 2,
        },
        {
          instructor_id: 1,
          skill_id: 11,
          score: 0.8,
          confidence: 0.5,
          evidence_count: 2,
        },
      ],
    });

    const res = await service.match({
      targets: [{ skillId: 10 }, { skillId: 11 }],
    });

    expect(res.targets.map((t) => t.weight)).toEqual([0.5, 0.5]);
    expect(res.ranked[0].fit).toBeCloseTo(0.6, 6);
  });

  it('confidenceAvg: weighted mean Σw·c/Σw, KHÔNG trung bình đơn giản', async () => {
    const { service } = makeService({
      eligible: [ann],
      profiles: [
        {
          instructor_id: 1,
          skill_id: 10,
          score: 0.6,
          confidence: 0.9,
          evidence_count: 5,
        },
        {
          instructor_id: 1,
          skill_id: 11,
          score: 0.6,
          confidence: 0.0,
          evidence_count: 1,
        },
      ],
    });

    const res = await service.match({
      targets: [
        { skillId: 10, weight: 3 },
        { skillId: 11, weight: 1 },
      ],
    });

    // weighted: (3·0.9 + 1·0)/4 = 0.675 (simple avg sẽ là 0.45)
    expect(res.ranked[0].confidenceAvg).toBeCloseTo(0.675, 6);
    // confidence không nhân vào fit
    expect(res.ranked[0].fit).toBeCloseTo(0.5675, 6);
  });

  it('thiếu profile → unknown, không gán score 0', async () => {
    const { service } = makeService({
      eligible: [ann],
      profiles: [
        {
          instructor_id: 1,
          skill_id: 10,
          score: 0.8,
          confidence: 0.5,
          evidence_count: 3,
        },
      ],
    });

    const res = await service.match({
      targets: [{ skillId: 10 }, { skillId: 11 }],
    });

    const r = res.ranked[0];
    expect(r.matchedSkills).toHaveLength(1);
    expect(r.unknownSkills).toEqual([
      { skillId: 11, name: 'Vocabulary', status: 'unknown' },
    ]);
    // fit = 0.8 (không phải (0.8+0)/2 = 0.4)
    expect(r.fit).toBeCloseTo(0.65, 6);
    expect(r.coverage).toBeCloseTo(0.5, 6);
    expect(r.matchedSkills[0]).not.toHaveProperty('score', 0);
    // coverage < 1 → lý do nêu rõ độ phủ
    expect(r.reasons.join(' ')).toContain('Độ phủ 50%');
  });

  it('low confidence pulls ranking toward neutral without removing the instructor', async () => {
    const { service } = makeService({
      eligible: [ann, bob],
      profiles: [
        {
          instructor_id: 1,
          skill_id: 10,
          score: 0.9,
          confidence: 0.05,
          evidence_count: 1,
        },
        {
          instructor_id: 2,
          skill_id: 10,
          score: 0.8,
          confidence: 0.9,
          evidence_count: 20,
        },
      ],
    });

    const res = await service.match({ targets: [{ skillId: 10 }] });

    expect(res.ranked[0].instructor.id).toBe(2);
    expect(res.ranked[1].confidenceAvg).toBeCloseTo(0.05, 6);
    expect(res.ranked).toHaveLength(2); // không filter ra bởi confidence
  });

  it('instructor không đủ điều kiện bị loại — eligibility query dùng đúng 3 rule repo', async () => {
    // SQL filter trả về list đã đủ điều kiện (PENDING/BLOCKED không có trong đó)
    const { service, query } = makeService({
      eligible: [ann],
      profiles: [
        {
          instructor_id: 1,
          skill_id: 10,
          score: 0.8,
          confidence: 0.5,
          evidence_count: 3,
        },
      ],
    });

    const res = await service.match({ targets: [{ skillId: 10 }] });

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('approval_status'),
      [ApprovalStatus.APPROVED, UserRole.INSTRUCTOR, UserStatus.ACTIVE],
    );
    expect(res.ranked.map((r) => r.instructor.id)).toEqual([1]);
    expect(res.insufficient).toHaveLength(0);
  });

  it('không có kết quả: không có instructor đủ điều kiện → mảng rỗng', async () => {
    const { service, query } = makeService({ eligible: [] });

    const res = await service.match({ targets: [{ skillId: 10 }] });

    expect(res.ranked).toEqual([]);
    expect(res.insufficient).toEqual([]);
    expect(res.meta).toEqual({
      eligible: 0,
      rankedCount: 0,
      insufficientCount: 0,
    });
    expect(query).toHaveBeenCalledTimes(1); // không query tiếp khi eligible rỗng
  });

  it('coverage = 0 → insufficient, không xếp hạng', async () => {
    const { service } = makeService({
      eligible: [ann],
      // profile chỉ có skill ngoài target list
      profiles: [
        {
          instructor_id: 1,
          skill_id: 99,
          score: 0.9,
          confidence: 0.5,
          evidence_count: 5,
        },
      ],
    });

    const res = await service.match({ targets: [{ skillId: 10 }] });

    expect(res.ranked).toEqual([]);
    expect(res.insufficient).toHaveLength(1);
    expect(res.insufficient[0]).toMatchObject({
      instructor: { id: 1, name: 'Ann' },
      status: 'insufficient_data',
      coverage: 0,
    });
  });

  it('coverage thấp vẫn xếp hạng nhưng thể hiện rõ coverage + lý do độ phủ', async () => {
    const { service } = makeService({
      eligible: [ann, bob],
      profiles: [
        // Ann: 1/3 skill, score cao
        {
          instructor_id: 1,
          skill_id: 10,
          score: 0.95,
          confidence: 0.5,
          evidence_count: 4,
        },
        // Bob: đủ 3 skill, score thấp hơn
        {
          instructor_id: 2,
          skill_id: 10,
          score: 0.7,
          confidence: 0.5,
          evidence_count: 4,
        },
        {
          instructor_id: 2,
          skill_id: 11,
          score: 0.7,
          confidence: 0.5,
          evidence_count: 4,
        },
        {
          instructor_id: 2,
          skill_id: 12,
          score: 0.7,
          confidence: 0.5,
          evidence_count: 4,
        },
      ],
    });

    const res = await service.match({
      targets: [{ skillId: 10 }, { skillId: 11 }, { skillId: 12 }],
    });

    expect(res.ranked.map((r) => r.instructor.id)).toEqual([2, 1]);
    expect(res.ranked[0].coverage).toBeCloseTo(1, 6);
    expect(res.ranked[1].coverage).toBeCloseTo(1 / 3, 6);
    expect(res.ranked[1].matchScore).toBeCloseTo(0.575, 6);
    expect(res.ranked[1].unknownSkills).toHaveLength(2);
    expect(res.ranked[1].reasons.join(' ')).toContain('Độ phủ 33%');
  });

  it('sources: chỉ trả source types thực có từ evidence, không nhãn giả', async () => {
    const { service } = makeService({
      eligible: [ann],
      profiles: [
        {
          instructor_id: 1,
          skill_id: 10,
          score: 0.8,
          confidence: 0.5,
          evidence_count: 4,
        },
        {
          instructor_id: 1,
          skill_id: 11,
          score: 0.7,
          confidence: 0.5,
          evidence_count: 1,
        },
      ],
      evidenceCounts: [
        {
          instructor_id: 1,
          skill_id: 10,
          source_type: SkillSourceType.STUDENT_RATING,
          cnt: 3,
        },
        {
          instructor_id: 1,
          skill_id: 10,
          source_type: SkillSourceType.CERTIFICATE,
          cnt: 1,
        },
        // skill 11: không có evidence count row → sources rỗng
      ],
    });

    const res = await service.match({
      targets: [{ skillId: 10 }, { skillId: 11 }],
    });

    const matched = res.ranked[0].matchedSkills;
    const s10 = matched.find((m) => m.skillId === 10)!;
    const s11 = matched.find((m) => m.skillId === 11)!;
    expect(s10.sources).toEqual([
      { type: SkillSourceType.STUDENT_RATING, count: 3 },
      { type: SkillSourceType.CERTIFICATE, count: 1 },
    ]);
    expect(s11.sources).toEqual([]);
    expect(res.ranked[0].reasons[0]).toContain('STUDENT_RATING');
  });

  it('sources query loại DECLARED — tự khai không liệt kê như nguồn score', async () => {
    const { service, query } = makeService({
      eligible: [ann],
      profiles: [
        {
          instructor_id: 1,
          skill_id: 10,
          score: 0.8,
          confidence: 0.5,
          evidence_count: 3,
          verified_ratio: 1,
        },
      ],
    });

    await service.match({ targets: [{ skillId: 10 }] });

    const evidenceSql = query.mock.calls
      .map((c) => String(c[0]))
      .find((sql) => sql.includes('FROM instructor_skill_evidences'))!;
    expect(evidenceSql).toContain("verification <> 'DECLARED'");
  });

  it('verifiedRatio: expose từ profile, tag lý do theo mức xác minh', async () => {
    const { service } = makeService({
      eligible: [ann, bob],
      profiles: [
        {
          instructor_id: 1,
          skill_id: 10,
          score: 0.8,
          confidence: 0.5,
          evidence_count: 4,
          verified_ratio: 1,
        },
        {
          instructor_id: 2,
          skill_id: 10,
          score: 0.8,
          confidence: 0.5,
          evidence_count: 4,
          verified_ratio: 0,
        },
      ],
      evidenceCounts: [
        {
          instructor_id: 1,
          skill_id: 10,
          source_type: SkillSourceType.CERTIFICATE,
          cnt: 4,
        },
      ],
    });

    const res = await service.match({ targets: [{ skillId: 10 }] });

    const annRank = res.ranked.find((r) => r.instructor.id === 1)!;
    const bobRank = res.ranked.find((r) => r.instructor.id === 2)!;
    expect(annRank.matchedSkills[0].verifiedRatio).toBe(1);
    expect(bobRank.matchedSkills[0].verifiedRatio).toBe(0);
    expect(annRank.reasons[0]).toContain('[Đã xác minh]');
    expect(bobRank.reasons[0]).toContain('[Suy luận]');
  });

  it('verifiedRatio thiếu cột (dữ liệu cũ) → 0, không NaN', async () => {
    const { service } = makeService({
      eligible: [ann],
      profiles: [
        {
          instructor_id: 1,
          skill_id: 10,
          score: 0.8,
          confidence: 0.5,
          evidence_count: 3,
        },
      ],
    });

    const res = await service.match({ targets: [{ skillId: 10 }] });

    expect(res.ranked[0].matchedSkills[0].verifiedRatio).toBe(0);
    expect(res.ranked[0].reasons[0]).toContain('[Suy luận]');
  });

  it('400: skill không tồn tại hoặc inactive', async () => {
    const { service } = makeService({ eligible: [ann], inactive: [10] });

    await expect(service.match({ targets: [{ skillId: 10 }] })).rejects.toThrow(
      BadRequestException,
    );
    await expect(
      service.match({ targets: [{ skillId: 404 }] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('400: không dùng năng lực kỳ thi như năng lực giảng dạy', async () => {
    const { service } = makeService({ eligible: [ann] });

    await expect(service.match({ targets: [{ skillId: 20 }] })).rejects.toThrow(
      'chưa được hỗ trợ cho matching',
    );
  });

  it('400: tổng trọng số bằng 0', async () => {
    const { service } = makeService({ eligible: [ann] });

    await expect(
      service.match({ targets: [{ skillId: 10, weight: 0 }] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('catalog: chỉ skill active, id trả về number', async () => {
    const { service, query } = makeService({ eligible: [] });

    const rows = await service.getCatalog();

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('is_active = TRUE'),
      [SkillCategory.LANGUAGE],
    );
    expect(rows).toEqual([
      {
        id: 10,
        code: 'grammar',
        name: 'Grammar',
        category: 'LANGUAGE',
      },
      {
        id: 11,
        code: 'vocabulary',
        name: 'Vocabulary',
        category: 'LANGUAGE',
      },
      {
        id: 12,
        code: 'pronunciation',
        name: 'Pronunciation',
        category: 'LANGUAGE',
      },
    ]);
  });
});

describe('SkillMatchingService.match — level opts', () => {
  const profileFor = (id: number, score = 0.8): ProfileRow => ({
    instructor_id: id,
    skill_id: 10,
    score,
    confidence: 0.5,
    evidence_count: 3,
  });

  it('không truyền opts → v1 y hệt: không level fields, không levelFilter', async () => {
    const { service } = makeService({
      eligible: [ann],
      profiles: [profileFor(1)],
    });

    const res = await service.match({ targets: [{ skillId: 10 }] });

    expect(res.ranked[0].instructor).not.toHaveProperty('teachesLevel');
    expect(res.ranked[0].instructor).not.toHaveProperty('levelDistance');
    expect(res.meta).not.toHaveProperty('levelFilter');
  });

  it('requireLevelMatch=true: loại adjacent + lệch xa; giữ exact + CHƯA khai báo', async () => {
    const exact: EligibleRow = {
      id: 1,
      name: 'Exact',
      headline: null,
      total_students: 1,
      avg_rating: null,
      teaching_levels: '["A1","B1"]',
    };
    const adjacent: EligibleRow = {
      id: 2,
      name: 'Adjacent',
      headline: null,
      total_students: 1,
      avg_rating: null,
      teaching_levels: '["A2"]',
    };
    const unknown: EligibleRow = {
      id: 3,
      name: 'Unknown',
      headline: null,
      total_students: 1,
      avg_rating: null,
      teaching_levels: null,
    };
    const far: EligibleRow = {
      id: 4,
      name: 'Far',
      headline: null,
      total_students: 1,
      avg_rating: null,
      teaching_levels: '["C1","C2"]',
    };

    const { service } = makeService({
      // fit: unknown (0.9) > far (0.85) > exact (0.8) > adjacent (0.75)
      eligible: [exact, adjacent, unknown, far],
      profiles: [
        profileFor(1, 0.8),
        profileFor(2, 0.75),
        profileFor(3, 0.9),
        profileFor(4, 0.85),
      ],
    });

    const res = await service.match(
      { targets: [{ skillId: 10 }] },
      { studentLevel: 'B1', requireLevelMatch: true },
    );

    expect(res.ranked.map((r) => r.instructor.id)).toEqual([1, 3]);
    expect(res.meta.levelFilter).toEqual({
      enabled: true,
      studentLevel: 'B1',
      excludedCount: 2,
    });
  });

  it('teachesLevel/levelDistance: exact=true/0, unknown=null/null, adjacent=false/1', async () => {
    const exact: EligibleRow = {
      id: 1,
      name: 'Exact',
      headline: null,
      total_students: 1,
      avg_rating: null,
      teaching_levels: '["B1"]',
    };
    const unknown: EligibleRow = {
      id: 2,
      name: 'Unknown',
      headline: null,
      total_students: 1,
      avg_rating: null,
      teaching_levels: '[]',
    };
    const adjacent: EligibleRow = {
      id: 3,
      name: 'Adjacent',
      headline: null,
      total_students: 1,
      avg_rating: null,
      teaching_levels: '["B2"]',
    };

    const { service } = makeService({
      eligible: [exact, unknown, adjacent],
      profiles: [profileFor(1), profileFor(2), profileFor(3)],
    });

    const res = await service.match(
      { targets: [{ skillId: 10 }] },
      { studentLevel: 'B1', requireLevelMatch: false },
    );

    const byId = new Map(
      res.ranked.map((r) => [r.instructor.id, r.instructor]),
    );
    expect(byId.get(1)!.teachesLevel).toBe(true);
    expect(byId.get(1)!.levelDistance).toBe(0);
    expect(byId.get(2)!.teachesLevel).toBeNull();
    expect(byId.get(2)!.levelDistance).toBeNull();
    expect(byId.get(3)!.teachesLevel).toBe(false);
    expect(byId.get(3)!.levelDistance).toBe(1);
  });

  it('tie-break: fit bằng nhau → exact (0) đứng trên adjacent (1) đứng trên unknown (null)', async () => {
    const unknown: EligibleRow = {
      id: 1,
      name: 'Unknown',
      headline: null,
      total_students: 1,
      avg_rating: null,
      teaching_levels: null,
    };
    const adjacent: EligibleRow = {
      id: 2,
      name: 'Adjacent',
      headline: null,
      total_students: 1,
      avg_rating: null,
      teaching_levels: '["A2"]',
    };
    const exact: EligibleRow = {
      id: 3,
      name: 'Exact',
      headline: null,
      total_students: 1,
      avg_rating: null,
      teaching_levels: '["B1"]',
    };

    const { service } = makeService({
      eligible: [unknown, adjacent, exact],
      profiles: [profileFor(1, 0.8), profileFor(2, 0.8), profileFor(3, 0.8)],
    });

    const res = await service.match(
      { targets: [{ skillId: 10 }] },
      { studentLevel: 'B1', requireLevelMatch: false },
    );

    expect(res.ranked.map((r) => r.instructor.id)).toEqual([3, 2, 1]);
  });

  it('studentLevel mà không bật requireLevelMatch → không lọc, adjacent vẫn trong kết quả', async () => {
    const adjacent: EligibleRow = {
      id: 1,
      name: 'Adjacent',
      headline: null,
      total_students: 1,
      avg_rating: null,
      teaching_levels: '["B2"]',
    };

    const { service } = makeService({
      eligible: [adjacent],
      profiles: [profileFor(1)],
    });

    const res = await service.match(
      { targets: [{ skillId: 10 }] },
      { studentLevel: 'B1', requireLevelMatch: false },
    );

    expect(res.ranked).toHaveLength(1);
    expect(res.meta.levelFilter?.enabled).toBe(false);
    expect(res.meta.levelFilter?.excludedCount).toBe(0);
  });

  it('giảng viên KHÔNG khai báo không bị loại vì thiếu dữ liệu', async () => {
    const unknown: EligibleRow = {
      id: 1,
      name: 'Unknown',
      headline: null,
      total_students: 1,
      avg_rating: null,
      teaching_levels: undefined,
    };

    const { service } = makeService({
      eligible: [unknown],
      profiles: [profileFor(1)],
    });

    const res = await service.match(
      { targets: [{ skillId: 10 }] },
      { studentLevel: 'C2', requireLevelMatch: true },
    );

    expect(res.ranked).toHaveLength(1);
    expect(res.ranked[0].instructor.teachesLevel).toBeNull();
  });

  it('lọc riêng giảng viên miễn phí khi hourly_rate = 0', async () => {
    const { service } = makeService({
      eligible: [
        { ...ann, hourly_rate: 0 },
        { ...bob, hourly_rate: 200_000 },
      ],
      profiles: [profileFor(1), profileFor(2)],
    });

    const res = await service.match(
      { targets: [{ skillId: 10 }] },
      { priceMode: 'FREE' },
    );

    expect(res.ranked.map((r) => r.instructor.id)).toEqual([1]);
    expect(res.ranked[0].instructor.hourlyRate).toBe(0);
    expect(res.meta.priceFilter).toEqual({
      mode: 'FREE',
      excludedCount: 1,
    });
  });

  it('lọc giảng viên trả phí theo khoảng học phí', async () => {
    const { service } = makeService({
      eligible: [
        { ...ann, hourly_rate: 0 },
        { ...bob, hourly_rate: 200_000 },
        { ...ann, id: 3, hourly_rate: 350_000 },
      ],
      profiles: [profileFor(1), profileFor(2), profileFor(3)],
    });

    const res = await service.match(
      { targets: [{ skillId: 10 }] },
      { priceMode: 'PAID', minHourlyRate: 150_000, maxHourlyRate: 250_000 },
    );

    expect(res.ranked.map((r) => r.instructor.id)).toEqual([2]);
    expect(res.ranked[0].instructor.hourlyRate).toBe(200_000);
    expect(res.meta.priceFilter?.excludedCount).toBe(2);
  });

  it('từ chối khoảng học phí có giá tối thiểu lớn hơn tối đa', async () => {
    const { service } = makeService({ eligible: [ann] });

    await expect(
      service.match(
        { targets: [{ skillId: 10 }] },
        { priceMode: 'PAID', minHourlyRate: 300_000, maxHourlyRate: 100_000 },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
