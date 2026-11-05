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
  /** Các band CEFR giảng dạy — null = chưa khai báo. */
  teachingLevels: string[] | null;
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
  websiteUrl?: string | null;
  teachingLevels?: string[] | null;
}

/** Thang CEFR cho chip chọn level giảng dạy. */
export const CEFR_LEVEL_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
