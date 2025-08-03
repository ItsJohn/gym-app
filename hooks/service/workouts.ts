import { useQuery } from "@tanstack/react-query";

import { WorkoutService } from "@/database/services/workoutService";

export const workoutKeys = {
  workouts: () => ["workouts"] as const,
  workout: (id: string) => ["workouts", id] as const,
  activeWorkouts: () => ["workouts", "active"] as const,
};

export const useActiveWorkouts = () => {
  return useQuery({
    queryKey: workoutKeys.activeWorkouts(),
    queryFn: () => WorkoutService.getActiveWorkouts(),
    staleTime: 5 * 60 * 1000,
  });
};
