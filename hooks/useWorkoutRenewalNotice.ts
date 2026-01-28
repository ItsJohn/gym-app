import { WorkoutService } from "@/database/services/workoutService";
import { useQuery } from "@tanstack/react-query";

const SIX_WEEKS_MS = 6 * 7 * 24 * 60 * 60 * 1000;

interface WorkoutRenewalNotice {
  shouldShowNotice: boolean;
  weeksOld: number;
}

export function useWorkoutRenewalNotice() {
  return useQuery<WorkoutRenewalNotice>({
    queryKey: ["workoutRenewalNotice"],
    queryFn: async () => {
      const latestWorkout = await WorkoutService.getLatestActiveWorkout();

      if (!latestWorkout || !latestWorkout.created_at) {
        return { shouldShowNotice: false, weeksOld: 0 };
      }

      const createdAt = new Date(latestWorkout.created_at);
      const now = new Date();
      const ageMs = now.getTime() - createdAt.getTime();
      const weeksOld = Math.floor(ageMs / (7 * 24 * 60 * 60 * 1000));

      return {
        shouldShowNotice: ageMs >= SIX_WEEKS_MS,
        weeksOld,
      };
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
