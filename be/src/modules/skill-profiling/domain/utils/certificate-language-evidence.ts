import type { CertificateOcrData } from '@/modules/instructor-applications/domain/utils/extract-certificate-ocr';
import {
  SkillCapability,
  SkillVerification,
} from '@/modules/skill-profiling/domain/enum/skill-verification.enum';

/**
 * Một draft evidence sinh từ chứng chỉ đã được admin duyệt.
 *
 * Nguyên tắc:
 * - Chỉ sinh bằng chứng NGÔN NGỮ (LANGUAGE); điểm IELTS trực tiếp là
 *   VERIFIED, tiêu chí suy ra từ Speaking là INFERRED.
 * - KHÔNG suy ra năng lực sư phạm (TEACHING) từ chứng chỉ ngôn ngữ.
 * - KHÔNG quy đổi điểm thi (band) sang CEFR. `cefr_level` chỉ được ghi lại
 *   khi chính chứng chỉ in ra nó, và chỉ nằm trong metadata để truy vết.
 * - Không có dữ liệu OCR -> không sinh evidence (unknown, không phải 0).
 */
export interface CertificateLanguageEvidence {
  skillCode: string;
  sourceType: 'CERTIFICATE';
  capability: SkillCapability.LANGUAGE;
  verification: SkillVerification;
  /** Điểm chuẩn hoá 0..1 chỉ để hiển thị/aggregate, KHÔNG phải CEFR. */
  score: number;
  confidence: number;
  observedAt: Date;
  rationale: string;
  metadata: {
    certificate_id: number;
    document_type: CertificateOcrData['document_type'];
    test_type: string | null;
    issuing_organization: string | null;
    test_report_form_number: string | null;
    scale: 'IELTS_BAND' | 'TOEIC_SECTION' | 'TOEIC_TOTAL';
    band: number;
    derived_from?: 'IELTS_SPEAKING';
    /** CEFR in trên chứng chỉ (nếu có) - không suy ra từ band. */
    cefr_level: CertificateOcrData['cefr_level'];
  };
}

// Evidence reliability after administrative verification. This is neither OCR
// extraction confidence nor the final skill-assessment confidence.
const VERIFIED_EVIDENCE_RELIABILITY = 0.9;
const INFERRED_EVIDENCE_RELIABILITY = 0.55;

const positive = (value: number | null | undefined): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : null;

const validIeltsBand = (value: number | null): number | null =>
  value != null && value <= 9 && Number.isInteger(value * 2) ? value : null;

const validToeicScore = (value: number | null, max: number): number | null =>
  value != null && value <= max && value % 5 === 0 ? value : null;

interface BuildInput {
  ocr: CertificateOcrData | null | undefined;
  certificateId: number;
  observedAt: Date;
}

export function buildCertificateLanguageEvidence(
  input: BuildInput,
): CertificateLanguageEvidence[] {
  const { ocr, certificateId, observedAt } = input;
  if (!ocr) return [];

  // Test mode: ngày thi OCR chỉ dùng để hiển thị/đối soát trên UI, chưa dùng
  // để loại evidence hoặc time-decay. Bật lại khi dữ liệu chứng chỉ là thật:
  // const testDate = ocr.test_date?.value;
  // const observedAt = testDate ? parseCertificateTestDate(testDate) : null;
  // if (!observedAt || isFutureCertificateTestDate(testDate)) return [];
  const base = {
    certificate_id: certificateId,
    document_type: ocr.document_type,
    test_type: ocr.test_type?.value ?? null,
    issuing_organization: ocr.issuing_organization?.value ?? null,
    test_report_form_number: ocr.test_report_form_number?.value ?? null,
    cefr_level: ocr.cefr_level,
  };
  const drafts: CertificateLanguageEvidence[] = [];

  const push = (
    skillCode: string,
    scale: CertificateLanguageEvidence['metadata']['scale'],
    band: number | null,
    maxBand: number,
    label: string,
    verification = SkillVerification.VERIFIED,
    confidence = VERIFIED_EVIDENCE_RELIABILITY,
    derivedFrom?: 'IELTS_SPEAKING',
  ) => {
    if (band == null || band > maxBand) return;
    drafts.push({
      skillCode,
      sourceType: 'CERTIFICATE',
      capability: SkillCapability.LANGUAGE,
      verification,
      score: band / maxBand,
      confidence,
      observedAt,
      rationale:
        verification === SkillVerification.INFERRED
          ? `${label} ${band} (suy luận từ IELTS Speaking; IELTS không công bố điểm thành phần này)`
          : `${label} ${band} (xác minh từ chứng chỉ đã duyệt)`,
      metadata: {
        ...base,
        scale,
        band,
        ...(derivedFrom ? { derived_from: derivedFrom } : {}),
      },
    });
  };

  const scores = ocr.scores ?? null;
  if (!scores) return [];

  const listening = positive(scores.listening);
  const reading = positive(scores.reading);
  const writing = positive(scores.writing);
  const speaking = positive(scores.speaking);
  const overall = positive(scores.overall);

  switch (ocr.document_type) {
    case 'IELTS_TRF': {
      push(
        'listening',
        'IELTS_BAND',
        validIeltsBand(listening),
        9,
        'IELTS Listening',
      );
      push(
        'reading',
        'IELTS_BAND',
        validIeltsBand(reading),
        9,
        'IELTS Reading',
      );
      push(
        'writing',
        'IELTS_BAND',
        validIeltsBand(writing),
        9,
        'IELTS Writing',
      );
      const speakingBand = validIeltsBand(speaking);
      push('speaking', 'IELTS_BAND', speakingBand, 9, 'IELTS Speaking');
      for (const [skillCode, label] of [
        ['grammar', 'Ngữ pháp ước tính từ IELTS Speaking'],
        ['vocabulary', 'Từ vựng ước tính từ IELTS Speaking'],
        ['pronunciation', 'Phát âm ước tính từ IELTS Speaking'],
      ] as const) {
        push(
          skillCode,
          'IELTS_BAND',
          speakingBand,
          9,
          label,
          SkillVerification.INFERRED,
          INFERRED_EVIDENCE_RELIABILITY,
          'IELTS_SPEAKING',
        );
      }
      push('ielts', 'IELTS_BAND', validIeltsBand(overall), 9, 'IELTS Overall');
      break;
    }
    case 'TOEIC': {
      const toeicListening = validToeicScore(listening, 495);
      const toeicReading = validToeicScore(reading, 495);
      const toeicOverall = validToeicScore(overall, 990);
      push(
        'listening',
        'TOEIC_SECTION',
        toeicListening,
        495,
        'TOEIC Listening',
      );
      push('reading', 'TOEIC_SECTION', toeicReading, 495, 'TOEIC Reading');
      if (toeicOverall != null) {
        push('toeic', 'TOEIC_TOTAL', toeicOverall, 990, 'TOEIC Total');
      } else if (toeicListening != null && toeicReading != null) {
        push(
          'toeic',
          'TOEIC_TOTAL',
          toeicListening + toeicReading,
          990,
          'TOEIC Total',
        );
      }
      break;
    }
    default:
      // Chứng chỉ không xác định được loại -> không đủ dữ liệu để tạo evidence.
      break;
  }

  return drafts;
}
