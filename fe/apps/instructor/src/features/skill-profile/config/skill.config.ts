export type ConfidenceLevel = "high" | "medium" | "low";
import type { SkillAssessmentStatus } from "../types/skill.types";

/**
 * 3 trạng thái hiển thị của một kỹ năng.
 * - no-data: chưa có dữ liệu nào → AI chưa thể đánh giá
 * - insufficient: đã có điểm tạm tính nhưng dữ liệu còn hạn chế
 * - assessed: AI đã đủ dữ liệu để kết luận
 * Ngưỡng 0.55 khớp với LIMITED_MAX_CONFIDENCE của backend (recommendation service).
 */
export type SkillState =
  "no-data" | "insufficient" | "provisional" | "assessed";

const INSUFFICIENT_CONFIDENCE_THRESHOLD = 0.55;

export function skillState(
  score: number | null,
  confidence: number | null,
  status?: SkillAssessmentStatus,
): SkillState {
  if (status === "NO_EVIDENCE") return "no-data";
  if (status === "INSUFFICIENT_EVIDENCE") return "insufficient";
  if (status === "PROVISIONAL") return "provisional";
  if (status === "ASSESSED") return "assessed";
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
    label: "Cần thêm dữ liệu",
    badgeClass:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  provisional: {
    label: "Điểm tạm thời",
    badgeClass:
      "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-300",
  },
  assessed: {
    label: "Đã đánh giá",
    badgeClass:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
};

/**
 * Copy tiếng Việt thân thiện cho catalog kỹ năng (catalog v2).
 * Fallback về name/description từ API nếu code không có trong map.
 * Đây chỉ là phần hiển thị — không tạo thêm dữ liệu/điểm.
 */
export const SKILL_COPY: Record<string, { name: string; description: string }> =
  {
    grammar: {
      name: "Ngữ pháp",
      description: "Ngữ pháp và cấu trúc câu tiếng Anh.",
    },
    vocabulary: {
      name: "Từ vựng",
      description: "Từ vựng và cách sử dụng từ trong ngữ cảnh.",
    },
    speaking: {
      name: "Kỹ năng nói",
      description: "Kỹ năng nói tiếng Anh trôi chảy và tự tin.",
    },
    listening: {
      name: "Kỹ năng nghe",
      description: "Kỹ năng nghe hiểu tiếng Anh.",
    },
    writing: {
      name: "Kỹ năng viết",
      description: "Kỹ năng viết và xây dựng bài viết.",
    },
    pronunciation: {
      name: "Phát âm",
      description: "Phát âm và ngữ âm tiếng Anh.",
    },
    reading: {
      name: "Kỹ năng đọc",
      description: "Đọc hiểu tiếng Anh.",
    },
    ielts: {
      name: "IELTS",
      description: "Điểm IELTS từ chứng chỉ được quản trị viên duyệt.",
    },
    toeic: {
      name: "TOEIC",
      description: "Điểm TOEIC từ chứng chỉ được quản trị viên duyệt.",
    },
    toefl: {
      name: "TOEFL",
      description: "Điểm TOEFL từ chứng chỉ được quản trị viên duyệt.",
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
    "Kỹ năng giảng dạy được AI đánh giá từ dữ liệu của bạn."
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
  return level === "high" ? "Mạnh" : level === "medium" ? "Đủ" : "Hạn chế";
}

export const LEVEL_TEXT: Record<ConfidenceLevel, string> = {
  high: "text-emerald-600 dark:text-emerald-400",
  medium: "text-sky-600 dark:text-sky-400",
  low: "text-amber-600 dark:text-amber-400",
};

export const LEVEL_BADGE: Record<ConfidenceLevel, string> = {
  high: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  medium:
    "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-300",
  low: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

export function confidenceTextClass(confidence: number | null): string {
  return LEVEL_TEXT[confidenceLevel(confidence)];
}

/** "Grammar Teaching" → "Grammar" (trục radar cho gọn) */
export function shortSkillLabel(name: string): string {
  return name.replace(/ Teaching$/, "");
}
