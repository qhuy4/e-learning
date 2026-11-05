import {
  certificateDisplayNameFromOcr,
  extractCertificateOcr,
} from './extract-certificate-ocr';

// Văn bản OCR thực tế từ một IELTS Academic Test Report Form — OCR.space trả
// về dạng markdown bảng, nhãn và giá trị nằm ở hai ô khác nhau.
const IELTS_TRF_MARKDOWN = `# IELTS™

Test Report Form

IELTS ACADEMIC

NOTE

| Centre Number | Test Date    | Candidate Number |
| :------------ | :----------- | :--------------- |
| GB250         | 01/01/2027   | 999999         |

## Candidate Details

| Family Name | First Name(s) | Candidate ID |
| :---------- | :------------ | :----------- |
| CHENG       | MIN           | 123456789    |

| Date of Birth | Sex | Scheme Code      |
| :------------ | :-- | :--------------- |
| 01/01/2000    | F   | Private Candidate |

| Country or Region of Origin | Country of Nationality | First Language |
| :-------------------------- | :--------------------- | :------------- |
|                             | ALBANIA                | ARABIC         |

## Test Results

| Listening | Reading | Writing | Speaking | Overall Band Score | CEFR Level |
| :-------- | :------ | :------ | :------- | :----------------- | :--------- |
| 9.0       | 9.0     | 9.0     | 9.0      | 9.0                | C2         |

## Administrator Comments

| Centre Stamp | Validation Stamp |
| :----------- | :--------------- |
|              |                  |

Administrator's
Signature

| Issue Date   | Test Report Form Number |
| :----------- | :---------------------- |
| 02/01/2027   | 123456789012345678      |

BRITISH
COUNCIL
idp
CAMBRIDGE
English

IELTS is jointly owned by the British Council, IDP IELTS, and Cambridge University Press and Assessment.`;

const TOEIC_TABLE_MARKDOWN = `TOEIC Listening & Reading

This is to certify that
NGUYEN VAN A

| Listening | Reading | Total |
| :-------- | :------ | :---- |
| 435       | 450     | 885   |

Date: 27-February-2026`;

describe('extractCertificateOcr', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-03T12:00:00Z'));
  });

  afterAll(() => jest.useRealTimers());

  describe('IELTS Academic Test Report Form in markdown tables', () => {
    const data = extractCertificateOcr(IELTS_TRF_MARKDOWN);

    it('detects the document type and test type', () => {
      expect(data.document_type).toBe('IELTS_TRF');
      expect(data.test_type?.value).toBe('ACADEMIC');
      expect(data.issuing_organization?.value).toBe('British Council');
      expect(
        certificateDisplayNameFromOcr(data, 'report.pdf'),
      ).toBe('IELTS Academic — Test Report Form');
    });

    it('reads the candidate name from the Family/First Name columns', () => {
      expect(data.candidate_name?.value).toBe('CHENG MIN');
    });

    it('reads the Test Report Form number, not the Candidate ID', () => {
      expect(data.test_report_form_number?.value).toBe('123456789012345678');
    });

    it('reads both dates', () => {
      expect(data.test_date?.value).toBe('2027-01-01');
      expect(data.date_of_birth?.value).toBe('2000-01-01');
    });

    it('reads all four band scores plus the overall band', () => {
      expect(data.scores).toEqual({
        listening: 9,
        reading: 9,
        writing: 9,
        speaking: 9,
        overall: 9,
      });
    });

    it('reads the CEFR level printed on the form', () => {
      expect(data.cefr_level).toBe('C2');
    });

    it('flags a future test date without silently replacing it', () => {
      expect(data.extraction_warnings).toContain('INVALID_DATE');
    });

    it('never derives CEFR from the score when the form does not print it', () => {
      const withoutCefr = extractCertificateOcr(
        IELTS_TRF_MARKDOWN.replace(/\bC2\b/, ''),
      );
      expect(withoutCefr.cefr_level).toBeNull();
      expect(withoutCefr.scores.overall).toBe(9);
    });
  });

  describe('TOEIC score report in markdown tables', () => {
    const data = extractCertificateOcr(TOEIC_TABLE_MARKDOWN);

    it('keeps TOEIC detection working through the flattening', () => {
      expect(data.document_type).toBe('TOEIC');
      expect(data.candidate_name?.value).toBe('NGUYEN VAN A');
      expect(data.scores).toEqual({
        listening: 435,
        reading: 450,
        writing: null,
        speaking: null,
        overall: 885,
      });
      expect(data.test_date?.value).toBe('2026-02-27');
      expect(data.extraction_warnings).toEqual([]);
      expect(
        certificateDisplayNameFromOcr(data, 'score.pdf'),
      ).toBe('TOEIC Listening & Reading — Score Report');
    });
  });

  it('rejects a malformed date instead of guessing', () => {
    const data = extractCertificateOcr(
      'IELTS Test Report Form\nTest Date: 32/13/2026',
    );
    expect(data.test_date).toBeNull();
  });

  it('leaves plain text untouched', () => {
    const plain =
      'IELTS Test Report Form\nTest Report Form Number: ABC123456\nOverall Band: 7.5';
    const data = extractCertificateOcr(plain);
    expect(data.test_report_form_number?.value).toBe('ABC123456');
    expect(data.scores.overall).toBe(7.5);
  });

  it('handles empty input', () => {
    const data = extractCertificateOcr(null);
    expect(data.document_type).toBe('UNKNOWN');
    expect(data.scores.overall).toBeNull();
    expect(data.extraction_warnings).toContain('MISSING_OVERALL');
  });
});
