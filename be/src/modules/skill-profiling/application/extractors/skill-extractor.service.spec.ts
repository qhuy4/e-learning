import { SkillExtractorService } from './skill-extractor.service';
import { SkillSourceType } from '../../domain/enum/skill-source-type.enum';

describe('SkillExtractorService MVP', () => {
  it('loads only verified certificates and completed-student reviews at runtime', async () => {
    const inserts: unknown[][] = [];
    const manager = {
      query: jest.fn((sql: string, params?: unknown[]) => {
        if (sql.includes('FROM instructor_skills')) {
          return [{ id: 10, code: 'instructional_clarity' }];
        }
        if (sql.includes('SELECT skill_id, source_type')) return [];
        if (sql.includes('SELECT id, skill_id, source_type')) return [];
        if (sql.includes('INSERT INTO instructor_skill_evidences')) {
          inserts.push(params ?? []);
        }
        return [];
      }),
    };
    const dataSource = {
      query: jest.fn((sql: string) => {
        if (sql.includes('FROM instructor_profiles')) return [{ user_id: 5 }];
        if (sql.includes('FROM courses c')) {
          return [
            {
              id: 34,
              title: 'English Foundation',
              published_at: new Date('2026-01-01'),
              created_at: new Date('2026-01-01'),
              categories: '',
            },
          ];
        }
        if (sql.includes('SELECT DISTINCT ON')) {
          return [
            {
              id: 21,
              user_id: 8,
              rating: 4,
              created_at: new Date('2026-10-01'),
              course_id: 34,
            },
          ];
        }
        if (sql.includes('FROM roadmap_reassessments')) return [];
        if (sql.includes('FROM instructor_certificates')) return [];
        throw new Error(`Unexpected loader: ${sql}`);
      }),
      transaction: jest.fn((callback: (value: typeof manager) => unknown) =>
        callback(manager),
      ),
    };

    const result = await new SkillExtractorService(
      dataSource as never,
    ).refreshForInstructor(2);

    expect(result.created).toBe(1);
    expect(inserts[0][2]).toBe(SkillSourceType.STUDENT_RATING);
    expect(inserts[0][9]).toMatchObject({
      independence_key: 'review-student:8',
    });
    const loaderSql = dataSource.query.mock.calls
      .map(([sql]) => sql)
      .join('\n');
    expect(loaderSql).toContain('SELECT DISTINCT ON (r.user_id, r.course_id)');
    expect(loaderSql).toContain('e.status IN (1, 2)');
    expect(loaderSql).toContain('e.progress = 100');
    expect(loaderSql).toContain("previousLevelSource' IN ('quiz', 'writing')");
    expect(loaderSql).toContain('ic.certificate_status = 2');
    expect(loaderSql).toContain('ic.expires_at >= CURRENT_DATE');
    expect(loaderSql).not.toContain('FROM lessons');
  });

  it('turns a completed-stage CEFR gain into one independent student outcome', async () => {
    const inserts: unknown[][] = [];
    const manager = {
      query: jest.fn((sql: string, params?: unknown[]) => {
        if (sql.includes('FROM instructor_skills')) {
          return [{ id: 12, code: 'student_engagement' }];
        }
        if (sql.includes('SELECT skill_id, source_type')) return [];
        if (sql.includes('SELECT id, skill_id, source_type')) return [];
        if (sql.includes('INSERT INTO instructor_skill_evidences')) {
          inserts.push(params ?? []);
        }
        return [];
      }),
    };
    const dataSource = {
      query: jest.fn((sql: string) => {
        if (sql.includes('FROM instructor_profiles')) return [{ user_id: 5 }];
        if (sql.includes('FROM courses c')) {
          return [
            {
              id: 34,
              title: 'A1 to A2',
              published_at: new Date('2026-01-01'),
              created_at: new Date('2026-01-01'),
              categories: '',
            },
          ];
        }
        if (sql.includes('SELECT DISTINCT ON')) return [];
        if (sql.includes('FROM roadmap_reassessments')) {
          return [
            {
              enrollment_id: 70,
              reassessment_id: 80,
              student_id: 9,
              course_id: 34,
              previous_level: 'A1',
              assessed_level: 'A2',
              reassessed_at: new Date('2026-10-10'),
            },
          ];
        }
        if (sql.includes('FROM instructor_certificates')) return [];
        throw new Error(`Unexpected loader: ${sql}`);
      }),
      transaction: jest.fn((callback: (value: typeof manager) => unknown) =>
        callback(manager),
      ),
    };

    const result = await new SkillExtractorService(
      dataSource as never,
    ).refreshForInstructor(2);

    expect(result.created).toBe(1);
    expect(inserts[0][2]).toBe(SkillSourceType.STUDENT_OUTCOME);
    expect(inserts[0][4]).toBe(0.65);
    expect(inserts[0][9]).toMatchObject({
      delta_bands: 1,
      independence_key: 'outcome-student:9',
    });
  });

  it('keeps certificate rows traceable but gives duplicate credentials one independence key', async () => {
    const inserts: unknown[][] = [];
    const manager = {
      query: jest.fn((sql: string, params?: unknown[]) => {
        if (sql.includes('FROM instructor_skills')) {
          return [{ id: 11, code: 'listening' }];
        }
        if (sql.includes('SELECT skill_id, source_type')) return [];
        if (sql.includes('SELECT id, skill_id, source_type')) return [];
        if (sql.includes('INSERT INTO instructor_skill_evidences')) {
          inserts.push(params ?? []);
        }
        return [];
      }),
    };
    const ocr = {
      document_type: 'IELTS_TRF',
      test_report_form_number: { value: 'abc123', confidence: null },
      test_date: { value: '2026-01-01', confidence: null },
      test_type: null,
      issuing_organization: null,
      scores: {
        overall: null,
        listening: 8.5,
        reading: null,
        writing: null,
        speaking: null,
      },
      cefr_level: null,
      document_image_hash: null,
    };
    const dataSource = {
      query: jest.fn((sql: string) => {
        if (sql.includes('FROM instructor_profiles')) return [{ user_id: 5 }];
        if (sql.includes('FROM courses c')) return [];
        if (sql.includes('SELECT DISTINCT ON')) return [];
        if (sql.includes('FROM roadmap_reassessments')) return [];
        if (sql.includes('FROM instructor_certificates')) {
          return [1, 2].map((id) => ({
            id,
            issued_at: '2026-01-01',
            created_at: new Date('2026-01-01'),
            reviewed_at: new Date('2026-01-02'),
            ocr_extracted_data: ocr,
          }));
        }
        throw new Error(`Unexpected loader: ${sql}`);
      }),
      transaction: jest.fn((callback: (value: typeof manager) => unknown) =>
        callback(manager),
      ),
    };

    await new SkillExtractorService(dataSource as never).refreshForInstructor(
      2,
    );

    expect(inserts.map((params) => params[3])).toEqual(['1', '2']);
    expect(
      inserts.map(
        (params) =>
          (params[9] as { independence_key: string }).independence_key,
      ),
    ).toEqual([
      'certificate-credential:IELTS_TRF:report:ABC123:date:2026-01-01',
      'certificate-credential:IELTS_TRF:report:ABC123:date:2026-01-01',
    ]);
  });

  it('supersedes revoked certificate evidence while preserving remaining certificates', async () => {
    const superseded: string[][] = [];
    const manager = {
      query: jest.fn((sql: string, params?: unknown[]) => {
        if (sql.includes('FROM instructor_skills')) {
          return [{ id: 11, code: 'listening' }];
        }
        if (sql.includes('SELECT skill_id, source_type')) return [];
        if (sql.includes('SELECT id, skill_id, source_type')) {
          return [
            {
              id: 202,
              skill_id: 11,
              source_type: SkillSourceType.CERTIFICATE,
              source_id: '2',
              metadata: { content_hash: 'old-toeic' },
            },
          ];
        }
        if (sql.includes("SET status = 'SUPERSEDED'")) {
          superseded.push((params?.[0] ?? []) as string[]);
          return { rowCount: 1 };
        }
        return [];
      }),
    };
    const dataSource = {
      query: jest.fn((sql: string) => {
        if (sql.includes('FROM instructor_profiles')) return [{ user_id: 5 }];
        if (sql.includes('FROM courses c')) return [];
        if (sql.includes('SELECT DISTINCT ON')) return [];
        if (sql.includes('FROM roadmap_reassessments')) return [];
        if (sql.includes('FROM instructor_certificates')) {
          return [
            {
              id: 1,
              issued_at: '2026-01-01',
              created_at: new Date('2026-01-01'),
              reviewed_at: new Date('2026-01-02'),
              ocr_extracted_data: {
                document_type: 'IELTS_TRF',
                test_report_form_number: {
                  value: 'IELTS-1',
                  confidence: null,
                },
                test_type: null,
                issuing_organization: null,
                scores: {
                  overall: null,
                  listening: 8.5,
                  reading: null,
                  writing: null,
                  speaking: null,
                },
                cefr_level: null,
                document_image_hash: null,
              },
            },
          ];
        }
        throw new Error(`Unexpected loader: ${sql}`);
      }),
      transaction: jest.fn((callback: (value: typeof manager) => unknown) =>
        callback(manager),
      ),
    };

    const result = await new SkillExtractorService(
      dataSource as never,
    ).refreshForInstructor(2);

    expect(result.superseded).toBe(1);
    expect(superseded).toContainEqual(['202']);
  });
});
