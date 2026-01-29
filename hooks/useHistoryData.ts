import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback } from "react";

import { SessionService } from "@/database/services/sessionService";
import { useActiveWorkouts, useLatestWorkoutStats } from "@/hooks";
import { sessionKeys } from "@/hooks/service/session";
import { Session } from "@/validation/session";

export function useHistoryData() {
  const { data: workoutStats, isLoading: isStatsLoading } =
    useLatestWorkoutStats();
  const { data: activeWorkouts, isLoading: isWorkoutsLoading } =
    useActiveWorkouts();

  const { data: allActiveWorkoutSessions, isLoading: isSessionsLoading } =
    useQuery({
      queryKey: sessionKeys.allActiveWorkoutSessions(),
      queryFn: async () => {
        if (!activeWorkouts || activeWorkouts.length === 0) {
          return [];
        }

        const allSessions: Session[] = [];

        for (const workout of activeWorkouts) {
          if (!workout.id) continue;

          try {
            const workoutSessions = await SessionService.getSessionsByWorkoutId(
              workout.id,
            );
            allSessions.push(...workoutSessions);
          } catch (error) {
            console.error(
              `Error fetching sessions for workout ${workout.id}:`,
              error,
            );
          }
        }

        return allSessions.sort((a, b) => {
          const dateA = a.started_at ? new Date(a.started_at).getTime() : 0;
          const dateB = b.started_at ? new Date(b.started_at).getTime() : 0;
          return dateB - dateA;
        });
      },
      enabled: !isWorkoutsLoading && !!activeWorkouts,
      staleTime: 2 * 60 * 1000,
    });

  const stats = {
    totalSessions: workoutStats?.total_sessions || 0,
    completedSessions: workoutStats?.completed_sessions || 0,
    totalDuration: workoutStats?.total_duration || 0,
    averageDuration: workoutStats?.average_session_duration || 0,
    totalWorkouts: workoutStats?.total_workouts || 0,
    currentStreak: 0,
    totalSets: workoutStats?.total_sets || 0,
    completedSets: workoutStats?.completed_sets || 0,
    totalExercises: workoutStats?.total_exercises || 0,
    totalWeight: workoutStats?.total_weight || 0,
    totalReps: workoutStats?.total_reps || 0,
    exercisesCompleted: workoutStats?.exercises_completed || 0,
    completionRate: workoutStats?.completion_rate || 0,
  };

  const handleSessionPress = useCallback(async (session: Session) => {
    router.push({
      pathname: "/workout",
      params: {
        workoutId: session.workout_id.toString(),
        sessionId: session.id?.toString(),
      },
    });
  }, []);

  const isLoading = isWorkoutsLoading || isStatsLoading || isSessionsLoading;

  return {
    stats,
    allActiveWorkoutSessions,
    isLoading,
    handleSessionPress,
  };
}
