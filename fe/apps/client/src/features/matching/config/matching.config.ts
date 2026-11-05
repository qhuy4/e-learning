import type { TranslationKey } from "@/i18n/translations";

/** Label + màu cho evidence source types — mapping tập trung (ui-conventions). */
export const SOURCE_KEYS: Record<string, TranslationKey> = {
    STUDENT_RATING: "match.source.studentRating",
    STUDENT_OUTCOME: "match.source.studentOutcome",
    LESSON_PLAN: "match.source.lessonPlan",
    CERTIFICATE: "match.source.certificate",
    EXPERIENCE: "match.source.experience",
    SELF_ASSESSMENT: "match.source.selfAssessment",
};

/** Skill code → i18n key. */
export const SKILL_CODE_KEYS: Record<string, TranslationKey> = {
    grammar: "match.skill.grammar",
    vocabulary: "match.skill.vocabulary",
    writing: "match.skill.writing",
    speaking: "match.skill.speaking",
    listening: "match.skill.listening",
    reading: "match.skill.reading",
    pronunciation: "match.skill.pronunciation",
};

/** Reliability của tín hiệu ngữ pháp → i18n key. */
export const RELIABILITY_KEYS: Record<string, TranslationKey> = {
    high: "match.rel.high",
    medium: "match.rel.medium",
    low: "match.rel.low",
    unavailable: "match.rel.unavailable",
};

/** CEFR band → i18n key. */
export const BAND_KEYS: Record<string, TranslationKey> = {
    "pre-A1": "match.band.preA1",
    A1: "match.band.A1",
    A2: "match.band.A2",
    B1: "match.band.B1",
    B2: "match.band.B2",
    C1: "match.band.C1",
    C2: "match.band.C2",
};

/** Kiểu sửa lỗi GEC → i18n key (fallback: giữ nguyên type thô). */
export const CORRECTION_TYPE_KEYS: Record<string, TranslationKey> = {
    replace: "match.s2.correctionType.replace",
    insert: "match.s2.correctionType.insert",
    delete: "match.s2.correctionType.delete",
};

/** Thay placeholder {n} {m}… trong chuỗi dịch. */
export const format = (
    template: string,
    vars: Record<string, string | number>,
): string =>
    Object.entries(vars).reduce(
        (acc, [key, value]) => acc.split(`{${key}}`).join(String(value)),
        template,
    );

/** Tên hiển thị của band — giữ nguyên chuỗi thô nếu band lạ (không đoán). */
export const bandLabel = (
    band: string,
    t: (key: TranslationKey) => string,
): string => (BAND_KEYS[band] ? t(BAND_KEYS[band]) : band);

const EMERALD = "bg-secondary/15 text-foreground border-secondary/50";
const AMBER = "bg-accent/20 text-foreground border-accent/60";
const RED = "bg-destructive/5 text-destructive border-destructive/30";
const NEUTRAL = "bg-muted/50 text-foreground border-border";

/** Badge màu theo coverage — thấp phải dễ nhận biết. */
export const coverageBadgeClass = (coverage: number): string => {
    if (coverage >= 0.75) return EMERALD;
    if (coverage >= 0.4) return AMBER;
    return RED;
};

export const verificationBadgeClass = (ratio: number): string => {
    if (ratio >= 0.999) return EMERALD;
    if (ratio > 0) return AMBER;
    return NEUTRAL;
};

export const verificationLabelKey = (ratio: number): TranslationKey => {
    if (ratio >= 0.999) return "match.card.verified";
    if (ratio > 0) return "match.card.partlyVerified";
    return "match.card.inferred";
};

export const percent = (value: number): string =>
    `${(value * 100).toFixed(1)}%`;

/** Badge theo khoảng cách level (match từ assessment) — mapping tập trung. */
export const levelBadgeClass = (
    distance: number | null | undefined,
): string => {
    if (distance === 0) return EMERALD;
    if (distance === 1) return AMBER;
    if (distance == null) return NEUTRAL;
    return RED;
};

export const levelLabel = (distance: number | null | undefined): string => {
    if (distance === 0) return "Đúng level";
    if (distance === 1) return "Lệch 1 bậc";
    if (distance == null) return "Chưa khai báo level";
    return `Lệch ${distance} bậc`;
};

/** Badge màu theo tin cậy tín hiệu ngữ pháp (assessment). */
export const reliabilityBadgeClass = (value: string): string => {
    if (value === "high") return EMERALD;
    if (value === "medium") return AMBER;
    return NEUTRAL;
};

/**
 * Ngưỡng hiển thị Grammar Quality Score — HEURISTIC UI TẠM THỜI.
 *
 * KHÔNG phải ranh giới trình độ CEFR đã hiệu chỉnh, KHÔNG phản ánh xác suất
 * đúng. Chỉ dùng để chọn màu badge. Thay đổi khi có dữ liệu calibration thật.
 */
export const GRAMMAR_QUALITY_THRESHOLDS = { good: 90, fair: 75 } as const;

/** Badge màu theo Grammar Quality Score (0–100) — chất lượng, KHÔNG phải confidence. */
export const grammarQualityBadgeClass = (score: number): string => {
    if (score >= GRAMMAR_QUALITY_THRESHOLDS.good) return EMERALD;
    if (score >= GRAMMAR_QUALITY_THRESHOLDS.fair) return AMBER;
    return RED;
};

/** Trạng thái đánh giá của từng kỹ năng trong hồ sơ (Bước 3) → i18n key. */
export const SKILL_STATUS_KEYS: Record<string, TranslationKey> = {
    assessed: "match.profile.status.assessed",
    insufficient: "match.profile.status.insufficient",
    not_assessed: "match.profile.status.not_assessed",
};

/** Nguồn bằng chứng (quiz / writing) → i18n key. */
export const SKILL_SOURCE_KEYS: Record<string, TranslationKey> = {
    quiz: "match.profile.source.quiz",
    writing: "match.profile.source.writing",
};

/**
 * Badge màu theo trạng thái đánh giá — mapping tập trung (ui-conventions).
 * assessed = xanh (có bằng chứng), insufficient = vàng (thiếu bằng chứng),
 * not_assessed = xám (chưa có nguồn đo — không bao giờ gán điểm).
 */
export const skillStatusBadgeClass = (status: string): string => {
    if (status === "assessed") return EMERALD;
    if (status === "insufficient") return AMBER;
    return NEUTRAL;
};
