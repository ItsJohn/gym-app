import { StyleSheet } from "react-native";

import GymLogo from "@/components/GymLogo";
import { SessionsSection } from "@/components/history/SessionsSection";
import { StatsSection } from "@/components/history/StatsSection";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SessionService } from "@/database/services/sessionService";
import { useActiveWorkouts, useLatestWorkoutStats } from "@/hooks";
import { sessionKeys } from "@/hooks/service/session";
import { Session } from "@/validation/session";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";

export default function HistoryScreen() {
  const { data: workoutStats, isLoading: isStatsLoading } =
    useLatestWorkoutStats();
  const { data: activeWorkouts, isLoading: isWorkoutsLoading } =
    useActiveWorkouts();

  // Get sessions from all active workouts
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

        // Sort by most recent first
        return allSessions.sort((a, b) => {
          const dateA = a.started_at ? new Date(a.started_at).getTime() : 0;
          const dateB = b.started_at ? new Date(b.started_at).getTime() : 0;
          return dateB - dateA;
        });
      },
      enabled: !isWorkoutsLoading && !!activeWorkouts,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

  // Transform workout stats to match the expected format for StatsSection
  const stats = {
    totalSessions: workoutStats?.total_sessions || 0,
    completedSessions: workoutStats?.completed_sessions || 0,
    totalDuration: workoutStats?.total_duration || 0,
    averageDuration: workoutStats?.average_session_duration || 0,
    totalWorkouts: workoutStats?.total_workouts || 0,
    currentStreak: 0, // This would need additional logic to calculate
    // Additional detailed stats
    totalSets: workoutStats?.total_sets || 0,
    completedSets: workoutStats?.completed_sets || 0,
    totalExercises: workoutStats?.total_exercises || 0,
    totalWeight: workoutStats?.total_weight || 0,
    totalReps: workoutStats?.total_reps || 0,
    exercisesCompleted: workoutStats?.exercises_completed || 0,
    completionRate: workoutStats?.completion_rate || 0,
  };

  const handleSessionPress = async (session: Session) => {
    router.push({
      pathname: "/workout",
      params: {
        workoutId: session.workout_id.toString(),
        sessionId: session.id?.toString(),
      },
    });
  };

  if (isWorkoutsLoading || isStatsLoading || isSessionsLoading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={<GymLogo />}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title">Loading...</ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<GymLogo />}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Active Workouts History</ThemedText>
        </ThemedView>

        <StatsSection stats={stats} />

        <SessionsSection
          sessions={allActiveWorkoutSessions || []}
          totalWorkouts={stats.totalWorkouts}
          onSessionPress={handleSessionPress}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
