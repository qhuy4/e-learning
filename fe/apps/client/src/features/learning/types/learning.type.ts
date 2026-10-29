// ─── Lesson Detail (từ GET /lessons/:id) ───────────────────────────────────
export interface LessonDetail {
  id: number;
  sectionId: number;
  title: string;
  slug: string;
  type: 'video' | 'reading' | string;
  videoProvider: string | null;
  videoSource: string | null;
  /** Ảnh xem trước (poster) — hiển thị trước khi bấm phát */
  thumbnail: string | null;
  duration: number | null;
  content: string | null;
  position: number;
  isPreview: boolean;
  status: number;
  /** true = bài đang bị khóa do bài đứng trước chưa hoàn thành (>= 90%) */
  isLocked?: boolean;
}

// ─── Course Learning (từ GET /courses/id/:id — dùng cho sidebar) ───────────
export interface LearningLesson {
  id: number;
  title: string;
  slug: string;
  type: 'video' | 'reading' | string;
  duration: number | null;
  position: number;
  isPreview: boolean;
}

export interface LearningSection {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  position: number;
  lessons: LearningLesson[];
}

export interface LearningCourse {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  sections: LearningSection[];
  instructor?: {
    id?: number;
    name?: string | null;
    headline?: string | null;
  } | null;
}

// ─── Lesson Progress ────────────────────────────────────────────────────────
export interface LessonProgress {
  id: number;
  userId: number;
  courseId: number;
  lessonId: number;
  watchSeconds: number;
  progressPercent: number;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseProgress {
  courseId: number;
  totalProgress: number;
  completedLessons: number;
  totalLessons: number;
  lessons: LessonProgress[];
}

// ─── Lesson Materials (tài liệu đính kèm theo bài học) ─────────────────────
export interface LessonMaterial {
  id: number;
  lessonId: number;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  downloadUrl: string | null;
  createdAt: string | null;
}
