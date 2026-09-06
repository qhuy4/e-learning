// ─── Lesson Detail (từ GET /lessons/:id) ───────────────────────────────────
export interface LessonDetail {
  id: number;
  sectionId: number;
  title: string;
  slug: string;
  type: 'video' | 'reading' | string;
  videoProvider: string | null;
  videoSource: string | null;
  duration: number | null;
  content: string | null;
  position: number;
  isPreview: boolean;
  status: number;
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
}
