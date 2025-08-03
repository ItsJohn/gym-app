import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { WorkoutService } from "@/database/services/workoutService";
import { Workout } from "@/validation/schemas";

export const workoutKeys = {
  workouts: () => ["workouts"] as const,
  workout: (id: number) => ["workouts", id] as const,
  activeWorkouts: () => ["workouts", "active"] as const,
  todaysWorkout: () => ["workouts", "todays"] as const,
};

export const useActiveWorkouts = (): UseQueryResult<Workout[]> => {
  return useQuery({
    queryKey: workoutKeys.activeWorkouts(),
    queryFn: () => WorkoutService.getActiveWorkouts(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useWorkouts = (): UseQueryResult<Workout[]> => {
  return useQuery({
    queryKey: workoutKeys.workouts(),
    queryFn: () => WorkoutService.getAllWorkouts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWorkout = (id: number): UseQueryResult<Workout | null> => {
  return useQuery({
    queryKey: workoutKeys.workout(id),
    queryFn: () => WorkoutService.getWorkoutById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
export const useTodaysWorkout = (): UseQueryResult<Workout | null> => {
  return useQuery({
    queryKey: workoutKeys.todaysWorkout(),
    queryFn: () => WorkoutService.getTodaysWorkout(),
    staleTime: 5 * 60 * 1000,
  });
};
