import { CourseMatchingService } from './course-matching.service';

describe('CourseMatchingService', () => {
  it('keeps courses covering the learner level and ranks weak-skill overlap', async () => {
    const profiles = {
      getProfile: jest.fn().mockResolvedValue({
        levelBand: 'A1',
        selfAssessment: { band: 'A1' },
        skills: [
          {
            code: 'grammar',
            status: 'assessed',
            scorePct: 30,
            qualityScore: null,
            band: null,
          },
          {
            code: 'speaking',
            status: 'assessed',
            scorePct: 60,
            qualityScore: null,
            band: null,
          },
        ],
      }),
    };
    const dataSource = {
      query: jest.fn().mockResolvedValue([
        {
          id: 1,
          title: 'Grammar A1',
          slug: 'grammar-a1',
          description: null,
          thumbnail: null,
          price: 0,
          cefr_level_start: 'A1',
          cefr_level_end: 'A2',
          skill_codes: ['grammar'],
          instructor_id: 9,
          instructor_name: 'Teacher',
        },
        {
          id: 2,
          title: 'Speaking B1',
          slug: 'speaking-b1',
          description: null,
          thumbnail: null,
          price: 0,
          cefr_level_start: 'B1',
          cefr_level_end: 'B2',
          skill_codes: ['speaking'],
          instructor_id: 9,
          instructor_name: 'Teacher',
        },
      ]),
    };
    const service = new CourseMatchingService(
      dataSource as never,
      profiles as never,
    );

    const result = await service.match(44);

    expect(result.courses.map((course) => course.id)).toEqual([1]);
    expect(result.courses[0].matchedSkills).toEqual(['grammar']);
  });
});
