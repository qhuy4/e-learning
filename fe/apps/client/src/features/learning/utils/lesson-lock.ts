import type { LearningSection } from '../types/learning.type';

/** Đồng bộ với backend (LessonAccessService): xem >= 90% bài trước thì mở khóa bài sau. */
export const LESSON_UNLOCK_PERCENT = 90;

export const LOCK_MESSAGES = {
  /** Học viên chưa mua / chưa ghi danh khóa học. */
  notEnrolled: 'Bạn cần mua khóa học để mở khóa bài học này.',
  /** Đã ghi danh nhưng bài đứng trước chưa hoàn thành. */
  previousIncomplete: 'Vui lòng hoàn thành bài học trước (xem ít nhất 90%) để mở khóa bài này.',
} as const;

export interface LessonProgressInfo {
  isCompleted: boolean;
  progressPercent: number;
  watchSeconds: number;
}

/**
 * Danh sách id bài bị khóa theo thứ tự học tuần tự:
 * bài đầu tiên luôn mở, bài sau chỉ mở khi bài đứng trước đã hoàn thành.
 * Chỉ tính khi học viên đã ghi danh — khách xem thử (preview) không áp dụng.
 */
export const buildSequentialLocks = (
  sections: LearningSection[],
  progressMap: Map<number, LessonProgressInfo>,
  options: { isEnrolled: boolean; isPreviewMode: boolean },
): Set<number> => {
  const lockedLessonIds = new Set<number>();
  if (!options.isEnrolled || options.isPreviewMode) return lockedLessonIds;

  let previousCompleted = true; // Bài đầu tiên của khóa luôn mở.
  for (const section of sections) {
    for (const lesson of section.lessons) {
      const lessonId = Number(lesson.id);
      // Bài xem thử không bị khóa (đồng bộ backend) nhưng vẫn tính độ hoàn thành
      // để mở bài đứng sau nó.
      if (!previousCompleted && !lesson.isPreview) lockedLessonIds.add(lessonId);

      const info = progressMap.get(lessonId);
      previousCompleted = info
        ? info.isCompleted || info.progressPercent >= LESSON_UNLOCK_PERCENT
        : false;
    }
  }

  return lockedLessonIds;
};

/** Lý do khóa của một bài cụ thể — null nếu mở. Dùng cho nút "Bài tiếp theo" / sidebar. */
export const getLessonLockMessage = (
  lesson: { id: number; isPreview: boolean } | null | undefined,
  lockedLessonIds: Set<number>,
  options: { isEnrolled: boolean; isPreviewMode: boolean },
): string | null => {
  if (!lesson) return null;
  if (!options.isPreviewMode && !lesson.isPreview && !options.isEnrolled) {
    return LOCK_MESSAGES.notEnrolled;
  }
  if (lockedLessonIds.has(Number(lesson.id))) return LOCK_MESSAGES.previousIncomplete;
  return null;
};
