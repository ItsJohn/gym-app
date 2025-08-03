import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";

import GymLogo from "@/components/GymLogo";
import {
  HomeHeader,
  NextWorkout,
  QuickActions,
  QuickStats,
  RecentActivity,
} from "@/components/home";
import ContinueWorkoutButton from "@/components/home/ContinueWorkoutButton";
import SchedulePreview from "@/components/home/SchedulePreview";
import TodaysWorkoutButton from "@/components/home/TodaysWorkoutButton";
import { EmptyState } from "@/components/landing/EmptyState";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SessionService } from "@/database/services/sessionService";
import { WorkoutService } from "@/database/services/workoutService";
import {
  useMostRecentIncompleteSession,
  useNextWorkout,
  useTodaysWorkout,
} from "@/hooks";
import { Session } from "@/validation/session";

export default function HomeScreen() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    recentSessions: 0,
    thisWeekSessions: 0,
  });
  const [recentSession, setRecentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: todaysWorkout, isLoading: isTodaysWorkoutLoading } =
    useTodaysWorkout();
  const { data: nextWorkout, isLoading: isNextWorkoutLoading } =
    useNextWorkout();
  const { data: incompleteSession, isLoading: isIncompleteSessionLoading } =
    useMostRecentIncompleteSession();

  const loadHomeData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load stats
      const workouts = await WorkoutService.getAllWorkouts();
      const sessions = await SessionService.getRecentSessions(10);

      // Calculate this week's sessions
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekSessions = sessions.filter(
        (s) => s.started_at && new Date(s.started_at) >= oneWeekAgo,
      ).length;

      setStats({
        totalWorkouts: workouts.length,
        recentSessions: sessions.length,
        thisWeekSessions,
      });

      // Get most recent session
      if (sessions.length > 0) {
        setRecentSession(sessions[0]);
      }
    } catch (err) {
      console.error("Error loading home data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on initial mount and refresh when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData]),
  );

  const handleStartWorkout = useCallback(() => {
    router.push("/workout");
  }, []);

  const handleManageWorkouts = useCallback(() => {
    router.push("/(tabs)/workouts");
  }, []);

  const handleViewHistory = useCallback(() => {
    router.push("/(tabs)/history");
  }, []);

  if (
    isLoading ||
    isTodaysWorkoutLoading ||
    isNextWorkoutLoading ||
    isIncompleteSessionLoading
  ) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={<GymLogo />}
      >
        <HomeHeader />
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading your fitness data...</ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  if (stats.totalWorkouts === 0) {
    return <EmptyState />;
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<GymLogo />}
    >
      <HomeHeader />

      {todaysWorkout ? (
        <TodaysWorkoutButton workout={todaysWorkout!} />
      ) : incompleteSession ? (
        <ContinueWorkoutButton session={incompleteSession} />
      ) : (
        <NextWorkout nextWorkout={nextWorkout} />
      )}

      <QuickStats
        totalWorkouts={stats.totalWorkouts}
        recentSessions={stats.recentSessions}
        thisWeekSessions={stats.thisWeekSessions}
      />

      <RecentActivity
        recentSession={recentSession}
        onViewHistory={handleViewHistory}
      />

      <QuickActions
        onStartWorkout={handleStartWorkout}
        onManageWorkouts={handleManageWorkouts}
        onViewHistory={handleViewHistory}
      />

      {/* <VisualStats /> */}
      <SchedulePreview onViewAllPress={handleManageWorkouts} />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
});
