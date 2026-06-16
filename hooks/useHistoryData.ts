import { useQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import { useCallback, useMemo } from "react";

import { SessionService } from "@/database/services/sessionService";
import { RunSession } from "@/database/types";
import { useLatestWorkoutStats } from "@/hooks";
import { useRecentRuns } from "@/hooks/useRunDetail";
import { sessionKeys } from "@/hooks/service/session";
import { Session } from "@/validation/session";

interface SessionWithTitle extends Session {
  workout_title?: string;
}

export type HistoryFeedItem =
  | { kind: "workout"; date: string; session: SessionWithTitle }
  | { kind: "run"; date: string; run: RunSession };

export function useHistoryData() {
  const { data: workoutStats, isLoading: isStatsLoading } =
    useLatestWorkoutStats();

  const {
    data: allActiveWorkoutSessions,
    isLoading: isSessionsLoading,
    error,
  } = useQuery({
    queryKey: sessionKeys.allActiveWorkoutSessions(),
    queryFn: () => SessionService.getAllSessions(),
    staleTime: 2 * 60 * 1000,
  });

  const { data: runs, isLoading: isRunsLoading } = useRecentRuns();

  const feed = useMemo<HistoryFeedItem[]>(() => {
    const workoutItems: HistoryFeedItem[] = (
      allActiveWorkoutSessions ?? []
    ).map((session) => ({
      kind: "workout",
      date: session.started_at ?? "",
      session,
    }));
    const runItems: HistoryFeedItem[] = (runs ?? []).map((run) => ({
      kind: "run",
      date: run.started_at,
      run,
    }));
    return [...workoutItems, ...runItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [allActiveWorkoutSessions, runs]);

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

  const handleSessionPress = useCallback((session: Session) => {
    router.push({
      pathname: "/workout",
      params: {
        workoutId: session.workout_id.toString(),
        sessionId: session.id?.toString(),
      },
    });
  }, []);

  const handleRunPress = useCallback((run: RunSession) => {
    router.push(`/run/${run.id}` as Href);
  }, []);

  const isLoading = isStatsLoading || isSessionsLoading || isRunsLoading;

  return {
    stats,
    feed,
    isLoading,
    error,
    handleSessionPress,
    handleRunPress,
  };
}
