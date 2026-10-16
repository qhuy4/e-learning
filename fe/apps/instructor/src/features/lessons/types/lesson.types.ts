export const LessonType = {
  VIDEO: 'video',
  AUDIO: 'audio',
  TEXT: 'text',
  DOCUMENT: 'document',
  QUIZ: 'quiz',
  LIVE: 'live',
} as const;

export type LessonType = (typeof LessonType)[keyof typeof LessonType];

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: 'Video',
  audio: 'Audio',
  text: 'Văn bản',
  document: 'Tài liệu',
  quiz: 'Bài kiểm tra',
  live: 'Trực tuyến',
};

export const MEDIA_TYPES: LessonType[] = ['video', 'audio'];

export interface Lesson {
  sectionId: number;
  title: string;
  type: LessonType;
  duration: number;
  position: number;
  isPreview: boolean;
  content: string;
  videoSource?: File | string;
  thumbnail?: File | string;
}

export interface LessonMaterial {
  id: number;
  lessonId: number;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  position?: number;
  downloadUrl: string | null;
  createdAt?: string | null;
}
