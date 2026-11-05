import { IsIn } from 'class-validator';

/** Bước 1 — sinh viên tự cảm nhận mức của mình (không phải CEFR chứng nhận). */
export const SELF_ASSESSMENT_BANDS = [
  'pre-A1',
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
  'auto',
] as const;

export type SelfAssessedBand = (typeof SELF_ASSESSMENT_BANDS)[number];

export class SelfAssessmentDto {
  @IsIn(SELF_ASSESSMENT_BANDS)
  band: SelfAssessedBand;
}
