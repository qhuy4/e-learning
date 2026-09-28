import { useQuery } from "@tanstack/react-query";
import { achievementService } from "../services/achievement.service";

export const achievementKeys = {
  all: ["achievements"] as const,
  my: () => [...achievementKeys.all, "my"] as const,
};

export function useMyAchievements() {
  return useQuery({
    queryKey: achievementKeys.my(),
    queryFn: () => achievementService.getMyAchievements(),
  });
}
