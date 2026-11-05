/**
 * Mức độ tin cậy của bằng chứng năng lực giảng viên.
 *
 * - VERIFIED: sinh từ dữ liệu đã được admin xác minh (chứng chỉ đã duyệt).
 * - DECLARED: giảng viên tự khai (không được dùng để tính score).
 * - INFERRED: suy luận từ hoạt động (đánh giá học viên, bài học, tiến độ,
 *   kinh nghiệm) — trọng số thấp hơn VERIFIED và phải hiển thị nhãn rõ ràng.
 */
export enum SkillVerification {
  VERIFIED = 'VERIFIED',
  DECLARED = 'DECLARED',
  INFERRED = 'INFERRED',
}

/** Năng lực ngôn ngữ (từ chứng chỉ) tách khỏi năng lực sư phạm. */
export enum SkillCapability {
  LANGUAGE = 'LANGUAGE',
  TEACHING = 'TEACHING',
}

/**
 * Hệ số trọng số theo mức xác minh. DECLARED = 0 vì dữ liệu tự khai không
 * tham gia vào score (chỉ hiển thị).
 */
export const VERIFICATION_WEIGHT: Record<SkillVerification, number> = {
  [SkillVerification.VERIFIED]: 1,
  [SkillVerification.INFERRED]: 0.5,
  [SkillVerification.DECLARED]: 0,
};
