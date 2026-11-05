import { createHash } from 'crypto';

export interface OcrFieldValue<T> {
  value: T;
  confidence: number | null;
}

export interface CertificateOcrScores {
  overall: number | null;
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
}

export type CertificateDocumentType = 'IELTS_TRF' | 'TOEIC' | 'UNKNOWN';

export type CertificateTestType = 'ACADEMIC' | 'GENERAL_TRAINING';

export type CertificateCefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface CertificateOcrData {
  document_type: CertificateDocumentType;
  candidate_name: OcrFieldValue<string> | null;
  test_report_form_number: OcrFieldValue<string> | null;
  test_date: OcrFieldValue<string> | null;
  date_of_birth: OcrFieldValue<string> | null;
  test_type: OcrFieldValue<CertificateTestType> | null;
  issuing_organization: OcrFieldValue<string> | null;
  scores: CertificateOcrScores;
  cefr_level: CertificateCefrLevel | null;
  verification_status: 'UNVERIFIED';
  extraction_warnings: string[];
  document_image_hash: string | null;
}

const field = <T>(value: T | null | undefined): OcrFieldValue<T> | null =>
  value == null || value === '' ? null : { value, confidence: null };

const emptyScores = (): CertificateOcrScores => ({
  overall: null,
  listening: null,
  reading: null,
  writing: null,
  speaking: null,
});

// ---------------------------------------------------------------------------
// Markdown table normalization
// ---------------------------------------------------------------------------

// OCR trả về bảng dạng markdown: nhãn nằm ở ô header, giá trị nằm ở ô dòng
// kế bên nên mọi regex "nhãn ... giá trị" đều trượt. Gộp mỗi bảng thành các
// dòng "Header: value" để các bộ trích xuất phía dưới chạy nguyên vẹn.
const TABLE_SEPARATOR_CELL = /^:?-{2,}:?$/;

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.length > 2 && t.startsWith('|') && t.endsWith('|');
}

function rowCells(line: string): string[] {
  return line
    .trim()
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim());
}

function flattenMarkdownTables(text: string): string {
  const output: string[] = [];
  let headers: string[] | null = null;

  for (const line of text.split('\n')) {
    if (!isTableRow(line)) {
      headers = null;
      output.push(line);
      continue;
    }

    const cells = rowCells(line);

    // Dòng đầu tiên của bảng là header, dòng kế là `---` phân cách.
    if (!headers) {
      headers = cells;
      continue;
    }
    if (cells.every((cell) => TABLE_SEPARATOR_CELL.test(cell))) continue;

    cells.forEach((cell, index) => {
      const header = headers?.[index];
      if (header && cell) output.push(`${header}: ${cell}`);
    });
  }

  return output.join('\n');
}


// ---------------------------------------------------------------------------
// Document type detection
// ---------------------------------------------------------------------------

function detectDocumentType(text: string): CertificateDocumentType {
  const t = text.toLowerCase();
  if (t.includes('toeic')) return 'TOEIC';
  const hasIelts = t.includes('ielts');
  const hasTrf =
    t.includes('test report form') ||
    t.includes('trf') ||
    /\b(candidate|test report)\b/.test(t);
  return hasIelts && hasTrf ? 'IELTS_TRF' : 'UNKNOWN';
}

// ---------------------------------------------------------------------------
// Field extraction helpers
// ---------------------------------------------------------------------------

function extractAfterLabel(
  text: string,
  labels: RegExp,
): string | null {
  const match = text.match(labels);
  if (!match) return null;
  const value = (match[1] ?? '').trim();
  return value || null;
}

const MONTHS: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

function normalizeDate(raw: string): string | null {
  const cleaned = raw.trim();

  let m = cleaned.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (m) {
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  }

  m = cleaned.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    if (day > 12 && month > 12) return null;
    const isoDay = day > 12 ? day : month;
    const isoMonth = day > 12 ? month : day;
    return `${m[3]}-${String(isoMonth).padStart(2, '0')}-${String(isoDay).padStart(2, '0')}`;
  }

  // "27-February-2026", "15 March 2026", "27 February 2026"
  m = cleaned.match(/^(\d{1,2})[-\s/]+([A-Za-z]{3,9})\.?,?[-\s/]+(\d{4})$/);
  if (m) {
    const monthNum = MONTHS[m[2].toLowerCase()];
    if (monthNum && Number(m[1]) >= 1 && Number(m[1]) <= 31) {
      return `${m[3]}-${String(monthNum).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
  }

  // "February 27, 2026", "February 27 2026"
  m = cleaned.match(/^([A-Za-z]{3,9})\.?[-\s/]+(\d{1,2}),?[-\s/]+(\d{4})$/);
  if (m) {
    const monthNum = MONTHS[m[1].toLowerCase()];
    if (monthNum && Number(m[2]) >= 1 && Number(m[2]) <= 31) {
      return `${m[3]}-${String(monthNum).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
    }
  }

  return null;
}

export function parseCertificateTestDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  return date.toISOString().slice(0, 10) === value ? date : null;
}

export function isFutureCertificateTestDate(
  value: string,
  now = new Date(),
): boolean {
  const date = parseCertificateTestDate(value);
  return date != null && date.getTime() > now.getTime() + 86_400_000;
}

function isValidIsoDate(value: string): boolean {
  const date = parseCertificateTestDate(value);
  return date != null && date.getTime() <= Date.now() + 10 * 365 * 86_400_000;
}

function extractDateAfterLabel(text: string, labels: RegExp): string | null {
  const raw = extractAfterLabel(text, labels);
  if (!raw) return null;
  const datePattern =
    /\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-\s/]+[A-Za-z]{3,9}[-\s/.,]+\d{4}|[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}/;
  const dateMatch = raw.match(datePattern);
  if (!dateMatch) return null;
  const iso = normalizeDate(dateMatch[0]);
  return iso && isValidIsoDate(iso) ? iso : null;
}

// Boilerplate that follows a name label but is not a person's name.
const NAME_BOILERPLATE =
  /^(?:sample|only|sample\s+only|certificate|certIFICATE|this|name|n\/a|none|test|candidate|student|participant|attendee)(?:\s+(?:only|copy|document|number|id))?$/i;

function isBoilerplateName(value: string): boolean {
  const v = value.trim();
  if (!v || /^\d+$/.test(v)) return true;
  return NAME_BOILERPLATE.test(v);
}

function cleanName(value: string): string {
  return value.replace(/\s{2,}/g, ' ').trim().slice(0, 255);
}

function extractCandidateName(text: string): string | null {
  // Bảng IELTS TRF tách họ và tên ra hai cột: "Family Name" + "First Name(s)".
  const family = extractAfterLabel(
    text,
    /^family\s*name\s*[:\-]\s*([^\n]{1,60})/im,
  );
  const given = extractAfterLabel(
    text,
    /^first\s*name(?:\s*\(s\)|s)?\s*[:\-]\s*([^\n]{1,60})/im,
  );
  const fromColumns = cleanName([family, given].filter(Boolean).join(' '));
  if (fromColumns && !isBoilerplateName(fromColumns)) return fromColumns;

  // "This is to certify that\nJane Smith" — the form used on TOEIC score reports.
  const certified = extractAfterLabel(
    text,
    /this\s+is\s+to\s+certify\s+that\s*[:\-]?\s*([^\n]{2,80})/i,
  );
  if (certified && !isBoilerplateName(certified)) {
    return cleanName(certified);
  }

  const direct = extractAfterLabel(
    text,
    /(?:candidate\s*name|full\s*name|name)\s*[:\-]?\s*([^\n]{2,80})/i,
  );
  if (direct && !isBoilerplateName(direct)) {
    return cleanName(direct);
  }

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length >= 3 && l.length <= 80);
  for (const line of lines) {
    if (!/^[A-ZÀ-Ỹ][A-ZÀ-Ỹ'\s]{2,60}$/.test(line)) continue;
    if (
      /IELTS|TOEIC|TOEFL|TEST|REPORT|FORM|BAND|SCORE|CERTIFICATE|ACHIEVEMENT|SAMPLE|ONLY/i.test(
        line,
      )
    ) {
      continue;
    }
    if (isBoilerplateName(line)) continue;
    return line.slice(0, 255);
  }
  return null;
}

function extractTrfNumber(text: string): string | null {
  // Ưu tiên số TRF thật: "Candidate ID" xuất hiện sớm hơn trong bảng nên
  // không được để nó giành match trước.
  const trf = extractAfterLabel(
    text,
    /(?:test\s*report\s*form\s*(?:number|no\.?)|trf\s*(?:number|no\.?))\s*[:\-#]?\s*([A-Z0-9-]{6,20})/i,
  );
  if (trf) return trf.toUpperCase();

  const candidateId = extractAfterLabel(
    text,
    /candidate\s*(?:id|reference)\s*[:\-#]?\s*([A-Z0-9-]{6,20})/i,
  );
  if (candidateId) return candidateId.toUpperCase();

  const bare = text.match(/\b([A-Z]{1,3}\d{6,14})\b/);
  return bare ? bare[1].toUpperCase() : null;
}

function extractTestType(text: string): CertificateTestType | null {
  const t = text.toLowerCase();
  if (/\bgeneral\s*training\b/.test(t)) return 'GENERAL_TRAINING';
  if (/\bacademic\b/.test(t)) return 'ACADEMIC';
  return null;
}

function extractIssuingOrganization(text: string): string | null {
  const organizations = [
    'British Council',
    'IDP: IELTS',
    'IDP IELTS',
    'Cambridge Assessment English',
    'Cambridge University Press & Assessment',
    'IELTS Partners',
    'ETS',
  ];
  for (const org of organizations) {
    if (text.toLowerCase().includes(org.toLowerCase())) {
      return org;
    }
  }
  const labeled = extractAfterLabel(
    text,
    /(?:issued?\s*by|issuer|organis?ation|cấp\s*bởi)\s*[:\-]?\s*([^\n]{3,80})/i,
  );
  return labeled;
}

// ---------------------------------------------------------------------------
// Score extraction
// ---------------------------------------------------------------------------

function isBandScore(value: number): boolean {
  if (!Number.isFinite(value) || value < 0 || value > 9) return false;
  const scaled = value * 2;
  return Math.abs(scaled - Math.round(scaled)) < 1e-9;
}

// TOEIC Listening & Reading: each section 5–495, total 10–990, steps of 5.
function isToeicScore(value: number, max: number): boolean {
  if (!Number.isFinite(value) || value < 5 || value > max) return false;
  return value % 5 === 0;
}

function extractBandAfterLabel(
  text: string,
  labels: RegExp,
): number | null {
  const match = text.match(labels);
  if (!match) return null;
  const value = Number(match[1]);
  return isBandScore(value) ? value : null;
}

function extractIeltsScores(text: string): CertificateOcrScores {
  const scores = emptyScores();

  scores.listening = extractBandAfterLabel(
    text,
    /(?:listening|nghe)\s*(?:score|band)?\s*[:\-]?\s*(\d(?:\.\d)?)/i,
  );
  scores.reading = extractBandAfterLabel(
    text,
    /(?:reading|đọc)\s*(?:score|band)?\s*[:\-]?\s*(\d(?:\.\d)?)/i,
  );
  scores.writing = extractBandAfterLabel(
    text,
    /(?:writing|viết)\s*(?:score|band)?\s*[:\-]?\s*(\d(?:\.\d)?)/i,
  );
  scores.speaking = extractBandAfterLabel(
    text,
    /(?:speaking|nói)\s*(?:score|band)?\s*[:\-]?\s*(\d(?:\.\d)?)/i,
  );
  scores.overall = extractBandAfterLabel(
    text,
    /(?:overall(?:\s*band)?(?:\s*score)?|tổng\s*điểm(?:\s*band)?(?:\s*score)?|total(?:\s*band)?(?:\s*score)?)\s*[:\-]?\s*(\d(?:\.\d)?)/i,
  );

  if (scores.overall == null) {
    const overallLine = text
      .split('\n')
      .find((line) => /\boverall\b|\bband\s*score\b|tổng\s*điểm/i.test(line));
    if (overallLine) {
      const numbers = overallLine.match(/\d(?:\.\d)?/g);
      for (const n of numbers ?? []) {
        const value = Number(n);
        if (isBandScore(value)) {
          scores.overall = value;
          break;
        }
      }
    }
  }

  if (scores.overall == null) {
    const bandMatch = text.match(/(?:band|overall)\s*(\d(?:\.\d)?)/i);
    if (bandMatch) {
      const value = Number(bandMatch[1]);
      if (isBandScore(value)) scores.overall = value;
    }
  }

  return scores;
}

// TOEIC Listening & Reading score report, e.g.
//   Listening 435
//   Reading 450
//   Total 885
function extractToeicScores(text: string): CertificateOcrScores {
  const scores = emptyScores();

  const lineValue = (labels: RegExp, max: number): number | null => {
    for (const line of text.split('\n')) {
      const match = line.match(labels);
      if (!match) continue;
      const value = Number(match[1]);
      if (isToeicScore(value, max)) return value;
    }
    return null;
  };

  scores.listening = lineValue(
    /\blistening\b\s*(?:score)?\s*[:\-]?\s*(\d{2,4})\b/i,
    495,
  );
  scores.reading = lineValue(
    /\breading\b\s*(?:score)?\s*[:\-]?\s*(\d{2,4})\b/i,
    495,
  );
  scores.overall = lineValue(
    /\b(?:total|overall)\b\s*(?:score)?\s*[:\-]?\s*(\d{2,4})\b/i,
    990,
  );

  return scores;
}

function roundToHalfBand(value: number): number {
  return Math.round(value * 2) / 2;
}

// ---------------------------------------------------------------------------
// CEFR level — only read from what the certificate itself states.
// Never inferred from scores.
// ---------------------------------------------------------------------------

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const CEFR_TOKEN = /\b(A1|A2|B1|B2|C1|C2)\b/i;

// Keywords that introduce a CEFR value — either naming CEFR directly,
// or a plain "level" label whose value is a CEFR token.
const CEFR_INTRODUCER =
  /(?:cefr|common\s+european\s+framework(?:\s+of\s+reference)?|khung\s+tham\s+chiếu|level|bậc|trình\s+độ)/i;

function asLevel(raw: string): CertificateCefrLevel | null {
  const level = raw.toUpperCase() as CertificateCefrLevel;
  return (CEFR_LEVELS as readonly string[]).includes(level) ? level : null;
}

function findLevelIn(window: string): CertificateCefrLevel | null {
  const token = window.match(CEFR_TOKEN);
  return token ? asLevel(token[1]) : null;
}

export function extractCefrLevel(text: string): CertificateCefrLevel | null {
  if (!text) return null;

  const normalized = text.replace(/\u00a0/g, ' ');

  // Cambridge / Goethe exam names that embed the level:
  // "C1 Advanced", "B2 First", "A2 Key"
  const exam = normalized.match(
    /\b(A1|A2|B1|B2|C1|C2)\s+(?:Key|Preliminary|First|Advanced|Proficiency|Goethe|Zertifikat)\b/i,
  );
  if (exam) return asLevel(exam[1]);

  // Scan line by line so an unrelated number elsewhere can't leak in.
  for (const line of normalized.split('\n')) {
    const intro = line.match(CEFR_INTRODUCER);
    if (!intro || intro.index == null) continue;
    const level = findLevelIn(line.slice(intro.index));
    if (level) return level;
  }

  // OCR often breaks between the label and its value. Allow a cross-line
  // window only for keywords that are unambiguous about naming CEFR —
  // generic "level" stays line-scoped to avoid false hits.
  const strong = normalized.match(
    /(?:cefr|common\s+european\s+framework(?:\s+of\s+reference)?|khung\s+tham\s+chiếu)/i,
  );
  if (strong?.index != null) {
    const level = findLevelIn(
      normalized.slice(strong.index, strong.index + 60),
    );
    if (level) return level;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Warnings
// ---------------------------------------------------------------------------

function buildWarnings(
  documentType: CertificateDocumentType,
  candidateName: string | null,
  trfNumber: string | null,
  testDate: string | null,
  scores: CertificateOcrScores,
): string[] {
  const warnings: string[] = [];

  if (documentType === 'UNKNOWN') {
    warnings.push('NOT_IELTS_TRF');
  }
  if (candidateName == null) warnings.push('MISSING_CANDIDATE_NAME');
  // Only IELTS reports carry a Test Report Form number.
  if (documentType === 'IELTS_TRF' && trfNumber == null) {
    warnings.push('MISSING_TRF_NUMBER');
  }
  if (testDate == null) warnings.push('MISSING_TEST_DATE');
  else if (isFutureCertificateTestDate(testDate)) warnings.push('INVALID_DATE');
  if (scores.overall == null) warnings.push('MISSING_OVERALL');

  if (documentType === 'TOEIC') {
    // TOEIC L&R reports two sections; Writing/Speaking are a separate test.
    const present = [scores.listening, scores.reading].filter(
      (v): v is number => v != null,
    );
    if (present.length === 0) {
      warnings.push('MISSING_COMPONENT_SCORES');
    } else if (present.length < 2) {
      warnings.push('INCOMPLETE_COMPONENT_SCORES');
    }
    if (present.length === 2 && scores.overall != null) {
      const sum = scores.listening! + scores.reading!;
      if (sum !== scores.overall) warnings.push('OVERALL_INCONSISTENT');
    }
    return warnings;
  }

  const components = [
    scores.listening,
    scores.reading,
    scores.writing,
    scores.speaking,
  ];
  const present = components.filter((v): v is number => v != null);
  if (present.length === 0) {
    warnings.push('MISSING_COMPONENT_SCORES');
  } else if (present.length < 4) {
    warnings.push('INCOMPLETE_COMPONENT_SCORES');
  }

  if (scores.overall != null && present.length === 4) {
    const avg = roundToHalfBand(
      (scores.listening! + scores.reading! + scores.writing! + scores.speaking!) / 4,
    );
    if (avg !== scores.overall) {
      warnings.push('OVERALL_INCONSISTENT');
    }
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// Main extraction
// ---------------------------------------------------------------------------

export function extractCertificateOcr(
  ocrRawText: string | null | undefined,
  fileBuffer?: Buffer | null,
): CertificateOcrData {
  const text = flattenMarkdownTables(ocrRawText?.trim() ?? '');

  const documentType: CertificateDocumentType = text
    ? detectDocumentType(text)
    : 'UNKNOWN';

  const documentImageHash = fileBuffer?.length
    ? createHash('sha256').update(fileBuffer).digest('hex')
    : null;

  if (!text) {
    return {
      document_type: 'UNKNOWN',
      candidate_name: null,
      test_report_form_number: null,
      test_date: null,
      date_of_birth: null,
      test_type: null,
      issuing_organization: null,
      scores: emptyScores(),
      cefr_level: null,
      verification_status: 'UNVERIFIED',
      extraction_warnings: buildWarnings(
        'UNKNOWN',
        null,
        null,
        null,
        emptyScores(),
      ),
      document_image_hash: documentImageHash,
    };
  }

  const candidateName = extractCandidateName(text);
  const trfNumber = extractTrfNumber(text);
  // TOEIC reports use a bare "date:" label; the lookahead stops it from
  // stealing "date of birth".
  const testDate = extractDateAfterLabel(
    text,
    /(?:test\s*date|date\s*of\s*test|exam\s*date|date(?!\s*of\s*birth))\s*[:\-]?\s*([^\n]{0,40})/i,
  );
  const dateOfBirth = extractDateAfterLabel(
    text,
    /(?:date\s*of\s*birth|dob|birth\s*date)\s*[:\-]?\s*([^\n]{0,40})/i,
  );
  const testType = extractTestType(text);
  const issuingOrganization = extractIssuingOrganization(text);
  const scores =
    documentType === 'IELTS_TRF'
      ? extractIeltsScores(text)
      : documentType === 'TOEIC'
        ? extractToeicScores(text)
        : emptyScores();

  const extractionWarnings = buildWarnings(
    documentType,
    candidateName,
    trfNumber,
    testDate,
    scores,
  );

  return {
    document_type: documentType,
    candidate_name: field(candidateName),
    test_report_form_number: field(trfNumber),
    test_date: field(testDate),
    date_of_birth: field(dateOfBirth),
    test_type: field(testType),
    issuing_organization: field(issuingOrganization),
    scores,
    cefr_level: extractCefrLevel(text),
    verification_status: 'UNVERIFIED',
    extraction_warnings: extractionWarnings,
    document_image_hash: documentImageHash,
  };
}

export function certificateDisplayNameFromOcr(
  ocrData: CertificateOcrData,
  fallbackFileName: string,
): string {
  if (ocrData.document_type === 'IELTS_TRF') {
    const typeLabel =
      ocrData.test_type?.value === 'GENERAL_TRAINING'
        ? 'IELTS General Training — Test Report Form'
        : 'IELTS Academic — Test Report Form';
    return typeLabel.slice(0, 255);
  }
  if (ocrData.document_type === 'TOEIC') {
    return 'TOEIC Listening & Reading — Score Report';
  }
  return fallbackFileName.replace(/\.[^.]+$/, '').slice(0, 255);
}
