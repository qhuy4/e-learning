export type ConfidenceLevel = "high" | "medium" | "low";

/**
 * 3 trạng thái hiển thị của một kỹ năng.
 * - no-data: chưa có bằng chứng nào → AI chưa thể đánh giá
 * - insufficient: đã có điểm tạm tính nhưng confidence thấp → cần thêm bằng chứng
 * - assessed: AI đã đủ dữ liệu để kết luận
 * Ngưỡng 0.55 khớp với LIMITED_MAX_CONFIDENCE của backend (recommendation service).
 */
export type SkillState = "no-data" | "insufficient" | "assessed";

const INSUFFICIENT_CONFIDENCE_THRESHOLD = 0.55;

export function skillState(
  score: number | null,
  confidence: number | null,
): SkillState {
  if (score == null) return "no-data";
  if (confidence == null || confidence < INSUFFICIENT_CONFIDENCE_THRESHOLD) {
    return "insufficient";
  }
  return "assessed";
}

export const SKILL_STATE_META: Record<
  SkillState,
  { label: string; badgeClass: string }
> = {
  "no-data": {
    label: "Chưa có dữ liệu",
    badgeClass: "border-border text-muted-foreground",
  },
  insufficient: {
    label: "Cần thêm bằng chứng",
    badgeClass:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  assessed: {
    label: "Đã đánh giá",
    badgeClass:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
};

/**
 * Copy tiếng Việt thân thiện cho catalog kỹ năng (seed 8 kỹ năng).
 * Fallback về name/description từ API nếu code không có trong map.
 * Đây chỉ là phần hiển thị — không tạo thêm dữ liệu/điểm.
 */
export const SKILL_COPY: Record<
  string,
  { name: string; description: string }
> = {
  grammar_teaching: {
    name: "Ngữ pháp",
    description: "Giảng dạy ngữ pháp và cấu trúc câu tiếng Anh.",
  },
  vocabulary_teaching: {
    name: "Từ vựng",
    description: "Giảng dạy từ vựng và cách sử dụng từ trong ngữ cảnh.",
  },
  speaking_teaching: {
    name: "Kỹ năng nói",
    description: "Giúp học viên nói tiếng Anh trôi chảy và tự tin.",
  },
  listening_teaching: {
    name: "Kỹ năng nghe",
    description: "Giảng dạy kỹ năng nghe hiểu tiếng Anh.",
  },
  writing_teaching: {
    name: "Kỹ năng viết",
    description: "Giảng dạy kỹ năng viết và xây dựng bài viết.",
  },
  pronunciation_teaching: {
    name: "Phát âm",
    description: "Giảng dạy phát âm và ngữ âm tiếng Anh.",
  },
  instructional_clarity: {
    name: "Độ rõ ràng khi giảng dạy",
    description: "Mức độ rõ ràng, dễ hiểu trong cách bạn giải thích bài học.",
  },
  student_engagement: {
    name: "Tương tác học viên",
    description: "Khả năng thu hút và tạo động lực học tập cho học viên.",
  },
};

export function skillDisplayName(skill: {
  code?: string | null;
  name: string;
}): string {
  return (skill.code && SKILL_COPY[skill.code]?.name) || skill.name;
}

export function skillDescription(skill: {
  code?: string | null;
  description?: string | null;
}): string {
  return (
    (skill.code && SKILL_COPY[skill.code]?.description) ||
    skill.description ||
    "Kỹ năng giảng dạy được AI đánh giá từ bằng chứng của bạn."
  );
}

/** score 0..1 → % (null = chưa đủ dữ liệu, KHÔNG phải 0) */
export function scorePercent(score: number | null): number | null {
  return score == null ? null : Math.round(score * 100);
}

export function confidenceLevel(confidence: number | null): ConfidenceLevel {
  if (confidence == null) return "low";
  if (confidence >= 0.7) return "high";
  if (confidence >= 0.45) return "medium";
  return "low";
}

export function confidenceLabel(confidence: number | null): string {
  if (confidence == null) return "Chưa đủ dữ liệu";
  const level = confidenceLevel(confidence);
  return level === "high" ? "Cao" : level === "medium" ? "Trung bình" : "Thấp";
}

export const LEVEL_TEXT: Record<ConfidenceLevel, string> = {
  high: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-rose-600 dark:text-rose-400",
};

export const LEVEL_BADGE: Record<ConfidenceLevel, string> = {
  high: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  medium: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300",
  low: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

export function confidenceTextClass(confidence: number | null): string {
  return LEVEL_TEXT[confidenceLevel(confidence)];
}

/** "Grammar Teaching" → "Grammar" (trục radar cho gọn) */
export function shortSkillLabel(name: string): string {
  return name.replace(/ Teaching$/, "");
}
