/** Item achievement (mapper của UserAchievementRepository.findByUser). */
export interface UserAchievementItem {
  id: number;
  userId: number;
  achievementId: number;
  earnedAt: Date;
  createdAt: Date | null;
  achievement?: {
    id: number;
    name: string;
    description: string;
    icon: string | null;
    criteria: string;
    threshold: number;
    reward: unknown;
  };
}

/** Kết quả của GetUserAchievementsQuery. */
export interface UserAchievementsResult {
  data: UserAchievementItem[];
}

export class GetUserAchievementsQuery {
  constructor(public readonly userId: number) {}
}
