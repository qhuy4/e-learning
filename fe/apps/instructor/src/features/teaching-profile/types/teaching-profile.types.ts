export const TEACHING_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type TeachingLevel = (typeof TEACHING_LEVELS)[number];

export interface TeachingProfileStats {
  courseCount: number;
  publishedCourseCount: number;
  lessonCount: number;
  certificateCount: number;
  studentCount: number;
  avgRating: number | null;
}

export interface TeachingProfileCompletionItem {
  key: string;
  label: string;
  done: boolean;
}

export interface TeachingProfile {
  headline: string | null;
  bio: string | null;
  websiteUrl: string | null;
  experienceYears: number | null;
  teachingLevels: string[];
  teachingMethods: string[];
  teachingVideoUrl: string | null;
  stats: TeachingProfileStats;
  subjects: string[];
  completion: {
    percent: number;
    items: TeachingProfileCompletionItem[];
  };
}

/** undefined = không đổi, null = xóa */
export interface UpdateTeachingProfileRequest {
  experienceYears?: number | null;
  teachingLevels?: string[] | null;
  teachingMethods?: string[] | null;
  teachingVideoUrl?: string | null;
  websiteUrl?: string | null;
}
