import { ExerciseService } from "@/database/services/exerciseService";
import { SessionService } from "@/database/services/sessionService";
import { WorkoutScheduleService } from "@/database/services/workoutScheduleService";
import { WorkoutService } from "@/database/services/workoutService";
import { UpdateWorkout } from "@/database/types";
import { Workout } from "@/validation/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMostRecentIncompleteSession } from "./service";

// Query Keys
export const workoutKeys = {
  all: ["workouts"] as const,
  lists: () => [...workoutKeys.all, "list"] as const,
  list: (filters: string) => [...workoutKeys.lists(), { filters }] as const,
  details: () => [...workoutKeys.all, "detail"] as const,
  detail: (id: number) => [...workoutKeys.details(), id] as const,
  withExercises: (id: number) =>
    [...workoutKeys.detail(id), "exercises"] as const,
  exercises: () => [...workoutKeys.all, "exercises"] as const,
  exercisesByWorkout: (workoutId: number) =>
    [...workoutKeys.exercises(), workoutId] as const,
  sessions: () => ["sessions"] as const,
  recentSessions: (limit: number) =>
    [...workoutKeys.sessions(), "recent", limit] as const,
  sessionDetails: (id: number) =>
    [...workoutKeys.sessions(), "detail", id] as const,
  schedule: () => ["schedule"] as const,
  todaysWorkout: () => [...workoutKeys.schedule(), "today"] as const,
  nextWorkout: () => [...workoutKeys.schedule(), "next"] as const,
  needingRenewal: () => [...workoutKeys.all, "renewal"] as const,
  todaysScheduledWorkout: () =>
    [...workoutKeys.schedule(), "scheduled", "today"] as const,
  nextScheduledWorkout: () =>
    [...workoutKeys.schedule(), "scheduled", "next"] as const,
};

export const useNextWorkout = () => {
  return useQuery({
    queryKey: workoutKeys.nextWorkout(),
    queryFn: () => WorkoutScheduleService.getNextScheduledWorkout(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useWorkoutsNeedingRenewal = () => {
  return useQuery({
    queryKey: workoutKeys.needingRenewal(),
    queryFn: () => WorkoutService.getWorkoutsNeedingRenewal(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Exercise Queries
export const useExercisesByWorkout = (workoutId?: number | null) => {
  return useQuery({
    queryKey: workoutKeys.exercisesByWorkout(workoutId!),
    queryFn: () =>
      ExerciseService.getExercisesByWorkoutId(workoutId!).catch((error) => {
        console.error("Error fetching exercises", error);
        return [];
      }),
    enabled: !!workoutId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useExercise = (id: string) => {
  return useQuery({
    queryKey: [...workoutKeys.exercises(), "detail", id],
    queryFn: () => ExerciseService.getExerciseById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Session Queries

export const useSessionDetails = (id: number) => {
  return useQuery({
    queryKey: workoutKeys.sessionDetails(id),
    queryFn: () => SessionService.getSessionWithDetails(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Schedule Queries
export const useTodaysScheduledWorkout = () => {
  return useQuery({
    queryKey: workoutKeys.todaysScheduledWorkout(),
    queryFn: () => WorkoutScheduleService.getTodaysWorkout(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useNextScheduledWorkout = () => {
  return useQuery({
    queryKey: workoutKeys.nextScheduledWorkout(),
    queryFn: () => WorkoutScheduleService.getNextScheduledWorkout(),
    staleTime: 30 * 60 * 1000,
  });
};

// Mutations
export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workout: Workout) => WorkoutService.createWorkout(workout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    },
  });
};

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: UpdateWorkout }) =>
      WorkoutService.updateWorkout(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
    },
  });
};

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => WorkoutService.deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    },
  });
};

// Export all hooks as default for convenience
export default {
  // Queries
  useWorkoutsNeedingRenewal,
  useExercisesByWorkout,
  useExercise,
  useSessionDetails,
  useNextWorkout,
  useMostRecentIncompleteSession,

  // Mutations
  useCreateWorkout,
  useUpdateWorkout,
  useDeleteWorkout,

  // Query keys for manual cache management
  workoutKeys,
};

// Timer hooks
export { useCountdown } from "./useCountdown";
export { useRestTimer } from "./useRestTimer";
export { useScrollTimeout } from "./useScrollTimeout";
export { useSessionSetStats } from "./useSessionSetStats";

export * from "./service";

export { useLastSessionDataForExercise } from "./service/session";
export { useExerciseStats } from "./useExerciseStats";
export { useLatestWorkoutStats } from "./useLatestWorkoutStats";
export { useWorkoutRenewalNotice } from "./useWorkoutRenewalNotice";
