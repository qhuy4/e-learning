export interface Lesson {
  id: string;
  title: string;
  type: "video" | "audio" | "text" | "document" | "quiz" | "live";
  duration?: number;
  position?: number;
  isPreview?: boolean;
  content?: string;
  videoSource?: File;
  thumbnail?: File;
}

export interface Section {
  id: string;
  title: string;
  position?: number;
  description?: string;
  lessons?: Lesson[];
}

export interface Course {
  id?: string;
  title: string;
  description?: string;
  thumbnail?: string | File;
  price?: number;
  level?: number;
  status?: number;
  parentId?: number;
  benefits?: string[];
  sections?: Section[];
}

export const CourseLevel = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
} as const;

export type CourseLevel = (typeof CourseLevel)[keyof typeof CourseLevel];

export const CourseStatus = {
  DRAFT: 1,
  PENDING_REVIEW: 2,
  APPROVED: 3,
  REJECTED: 4,
  PUBLISHED: 5,
  ARCHIVED: 6,
} as const;

export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus];
