export type AchievementCriteria =
  | "LESSONS_COMPLETED"
  | "COURSES_COMPLETED"
  | "QUIZZES_COMPLETED"
  | "LEARNING_HOURS";

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  criteria: AchievementCriteria;
  threshold: number;
  reward: unknown;
  isActive: boolean;
  earnedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementUser {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  achievementId: number;
  achievementName: string;
  earnedAt: string;
}

export interface PaginatedAchievementResponse {
  data: Achievement[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedAchievementUserResponse {
  data: AchievementUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const achievementCriteriaLabel: Record<AchievementCriteria, string> = {
  LESSONS_COMPLETED: "Bài học",
  COURSES_COMPLETED: "Khóa học",
  QUIZZES_COMPLETED: "Quiz",
  LEARNING_HOURS: "Giờ học",
};
