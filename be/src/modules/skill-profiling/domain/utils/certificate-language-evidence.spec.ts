import type { CertificateOcrData } from '@/modules/instructor-applications/domain/utils/extract-certificate-ocr';
import {
  SkillCapability,
  SkillVerification,
} from '@/modules/skill-profiling/domain/enum/skill-verification.enum';
import { buildCertificateLanguageEvidence } from './certificate-language-evidence';

const field = <T>(value: T) => ({ value, confidence: null });

const emptyScores = () => ({
  overall: null as number | null,
  listening: null as number | null,
  reading: null as number | null,
  writing: null as number | null,
  speaking: null as number | null,
});

const ielts = (
  scores: Partial<ReturnType<typeof emptyScores>>,
  cefr: CertificateOcrData['cefr_level'] = null,
  testDate = '2026-01-01',
): CertificateOcrData => ({
  document_type: 'IELTS_TRF',
  candidate_name: field('CHENG MIN'),
  test_report_form_number: field('123456789012345678'),
  test_date: field(testDate),
  date_of_birth: field('2000-01-01'),
  test_type: field('ACADEMIC'),
  issuing_organization: field('British Council'),
  scores: { ...emptyScores(), ...scores },
  cefr_level: cefr,
  verification_status: 'UNVERIFIED',
  extraction_warnings: [],
  document_image_hash: null,
});

const toeic = (
  scores: Partial<ReturnType<typeof emptyScores>>,
): CertificateOcrData => ({
  document_type: 'TOEIC',
  candidate_name: field('Jane Smith'),
  test_report_form_number: field('987654'),
  test_date: field('2026-02-27'),
  date_of_birth: null,
  test_type: null,
  issuing_organization: field('IIG Vietnam'),
  scores: { ...emptyScores(), ...scores },
  cefr_level: null,
  verification_status: 'UNVERIFIED',
  extraction_warnings: [],
  document_image_hash: null,
});

const build = (ocr: CertificateOcrData | null) =>
  buildCertificateLanguageEvidence({
    ocr,
    certificateId: 42,
    observedAt: new Date('2026-11-03T12:00:00Z'),
  });

describe('buildCertificateLanguageEvidence', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-03T12:00:00Z'));
  });

  afterAll(() => jest.useRealTimers());

  it('maps every IELTS component plus overall to verified LANGUAGE evidence', () => {
    const drafts = build(
      ielts(
        {
          overall: 7.5,
          listening: 8,
          reading: 7.5,
          writing: 7,
          speaking: 8,
        },
        'C1',
      ),
    );

    expect(drafts.map((d) => d.skillCode).sort()).toEqual(
      [
        'grammar',
        'ielts',
        'listening',
        'pronunciation',
        'reading',
        'speaking',
        'vocabulary',
        'writing',
      ].sort(),
    );
    for (const draft of drafts) {
      expect(draft.capability).toBe(SkillCapability.LANGUAGE);
      expect(draft.sourceType).toBe('CERTIFICATE');
      expect(draft.metadata.certificate_id).toBe(42);
    }

    const writing = drafts.find((d) => d.skillCode === 'writing')!;
    expect(writing.metadata).toMatchObject({
      scale: 'IELTS_BAND',
      band: 7,
      cefr_level: 'C1',
      document_type: 'IELTS_TRF',
    });
    expect(writing.score).toBeCloseTo(7 / 9, 5);

    const overall = drafts.find((d) => d.skillCode === 'ielts')!;
    expect(overall.metadata.band).toBe(7.5);
    expect(overall.score).toBeCloseTo(7.5 / 9, 5);

    const pronunciation = drafts.find((d) => d.skillCode === 'pronunciation')!;
    expect(pronunciation).toMatchObject({
      verification: SkillVerification.INFERRED,
      confidence: 0.55,
      score: 8 / 9,
    });
    expect(pronunciation.metadata.derived_from).toBe('IELTS_SPEAKING');

    const speaking = drafts.find((d) => d.skillCode === 'speaking')!;
    expect(speaking.verification).toBe(SkillVerification.VERIFIED);
    expect(speaking.confidence).toBe(0.9);
  });

  it('maps TOEIC listening/reading and derives total only when both exist', () => {
    const drafts = build(toeic({ listening: 450, reading: 435 }));
    expect(drafts.map((d) => d.skillCode).sort()).toEqual(
      ['listening', 'reading', 'toeic'].sort(),
    );
    const total = drafts.find((d) => d.skillCode === 'toeic')!;
    expect(total.metadata).toMatchObject({ scale: 'TOEIC_TOTAL', band: 885 });
    expect(total.score).toBeCloseTo(885 / 990, 5);
  });

  it('uses a printed TOEIC total even when component scores are missing', () => {
    const drafts = build(toeic({ overall: 900 }));
    expect(drafts.map((d) => d.skillCode)).toEqual(['toeic']);
    expect(drafts[0].metadata).toMatchObject({
      scale: 'TOEIC_TOTAL',
      band: 900,
    });
  });

  it('does not invent a TOEIC total when one section is missing', () => {
    const drafts = build(toeic({ listening: 450 }));
    expect(drafts.map((d) => d.skillCode)).toEqual(['listening']);
  });

  it('returns no evidence when the certificate has no OCR data', () => {
    expect(build(null)).toEqual([]);
  });

  it('returns no evidence when OCR has no scores', () => {
    expect(build(ielts({}))).toEqual([]);
  });

  it('returns no evidence for an unknown document type, even with a name', () => {
    const unknown: CertificateOcrData = {
      ...ielts({ overall: 7 }),
      document_type: 'UNKNOWN',
    };
    expect(build(unknown)).toEqual([]);
  });

  it('keeps IELTS criterion estimates as inferred language evidence', () => {
    const drafts = build(
      ielts(
        { overall: 9, listening: 9, reading: 9, writing: 9, speaking: 9 },
        'C2',
      ),
    );
    for (const draft of drafts) {
      expect(draft.capability).toBe(SkillCapability.LANGUAGE);
    }
    const inferred = drafts.filter((draft) =>
      ['grammar', 'vocabulary', 'pronunciation'].includes(draft.skillCode),
    );
    expect(inferred).toHaveLength(3);
    expect(
      inferred.every(
        (draft) => draft.verification === SkillVerification.INFERRED,
      ),
    ).toBe(true);
    expect(drafts.map((draft) => draft.skillCode)).not.toContain(
      'instructional_clarity',
    );
  });

  it('ignores zero and non-finite scores', () => {
    const drafts = build(
      ielts({
        overall: 0,
        listening: Number.NaN,
        reading: 6,
        writing: null,
        speaking: 0,
      }),
    );
    expect(drafts.map((d) => d.skillCode)).toEqual(['reading']);
  });

  it('rejects out-of-range OCR scores instead of clamping them to 100%', () => {
    expect(build(ielts({ listening: 99 }))).toEqual([]);
    expect(build(toeic({ overall: 9999, reading: 9999 }))).toEqual([]);
  });

  it('rejects scores outside the official IELTS and TOEIC increments', () => {
    expect(build(ielts({ listening: 8.3 }))).toEqual([]);
    expect(build(toeic({ listening: 452, overall: 901 }))).toEqual([]);
  });

  it('keeps the printed CEFR untouched and never derives it from the band', () => {
    const drafts = build(ielts({ overall: 9, writing: 9 }, null));
    for (const draft of drafts) {
      expect(draft.metadata.cefr_level).toBeNull();
    }
  });

  it('does not emit evidence when only a CEFR level is printed (no skill scores)', () => {
    expect(build(ielts({}, 'B2'))).toEqual([]);
  });

  it('keeps a future OCR test date display-only while test data is enabled', () => {
    const drafts = build(
      ielts({ overall: 9, listening: 9 }, 'C2', '2027-01-01'),
    );
    expect(drafts.map((draft) => draft.skillCode).sort()).toEqual(
      ['ielts', 'listening'].sort(),
    );
  });

  it('uses the supplied review date for assessment instead of the OCR test date', () => {
    const drafts = build(toeic({ overall: 885 }));
    expect(drafts[0].observedAt.toISOString()).toBe('2026-11-03T12:00:00.000Z');
  });
});
