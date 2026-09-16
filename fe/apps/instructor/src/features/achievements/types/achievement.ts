export type AchievementCriteria =
  | 'LESSONS_COMPLETED'
  | 'COURSES_COMPLETED'
  | 'QUIZZES_COMPLETED'
  | 'LEARNING_HOURS'
  | 'PERFECT_QUIZ_SCORE'
  | 'HIGH_QUIZ_SCORES'
  | 'STREAK_DAYS'
  | 'SPEAKING_SESSIONS'
  | 'GRAMMAR_EXERCISES'
  | 'VOCABULARY_WORDS'
  | 'ACHIEVEMENTS_EARNED';

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  category: string | null;
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
  PERFECT_QUIZ_SCORE: 'Quiz 100%',
  HIGH_QUIZ_SCORES: 'Quiz 90%+',
  STREAK_DAYS: 'Chuỗi ngày học',
  SPEAKING_SESSIONS: 'Speaking',
  GRAMMAR_EXERCISES: 'Grammar',
  VOCABULARY_WORDS: 'Từ vựng',
  ACHIEVEMENTS_EARNED: 'Thành tựu',
};
