import { AchievementCriteria } from '@/modules/achievements/domain/enum/achievement-criteria.enum';

export class LearningEvent {
  constructor(
    public readonly userId: number,
    public readonly type: AchievementCriteria,
    public readonly metadata?: {
      courseId?: number;
      lessonId?: number;
      hours?: number;
    },
  ) {}
}
