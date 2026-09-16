export type AchievementCriteria = 'LESSONS_COMPLETED' | 'COURSES_COMPLETED' | 'QUIZZES_COMPLETED' | 'LEARNING_HOURS';

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  criteria: AchievementCriteria;
  threshold: number;
  reward: unknown;
  isActive: boolean;
  earnedAt: string;
}

export const achievementCriteriaLabel: Record<AchievementCriteria, string> = {
  LESSONS_COMPLETED: 'Bài học',
  COURSES_COMPLETED: 'Khóa học',
  QUIZZES_COMPLETED: 'Quiz',
  LEARNING_HOURS: 'Giờ học',
};
