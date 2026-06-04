import { router } from "expo-router";
import { useCallback } from "react";
import { StyleSheet } from "react-native";

import GymLogo from "@/components/GymLogo";
import {
  HomeHeader,
  NextWorkout,
  QuickStats,
  RecentActivity,
  WorkoutRenewalBanner,
} from "@/components/home";
import ContinueWorkoutButton from "@/components/home/ContinueWorkoutButton";
import SchedulePreview from "@/components/home/SchedulePreview";
import TodaysWorkoutButton from "@/components/home/TodaysWorkoutButton";
import { WorkoutCompleteButton } from "@/components/home/WorkoutCompleteButton";
import { EmptyState } from "@/components/landing/EmptyState";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useHomeData } from "@/hooks/useHomeData";
import {
  useMostRecentIncompleteSession,
  useNextWorkout,
  useTodaysWorkout,
  useTodaysWorkoutCompletion,
  useWorkoutRenewalNotice,
} from "@/hooks";
import { useStravaSync } from "@/hooks/useStravaSync";

export default function HomeScreen() {
  const { stats, recentSession, isLoading } = useHomeData();
  const { data: todaysWorkout, isLoading: isTodaysWorkoutLoading } =
    useTodaysWorkout();
  const { data: nextWorkout, isLoading: isNextWorkoutLoading } =
    useNextWorkout();
  const { data: incompleteSession, isLoading: isIncompleteSessionLoading } =
    useMostRecentIncompleteSession();
  const {
    data: todaysWorkoutCompleted,
    isLoading: isTodaysWorkoutCompletedLoading,
  } = useTodaysWorkoutCompletion();
  const { data: renewalNotice } = useWorkoutRenewalNotice();

  // Silently sync Strava in the background on every app open
  useStravaSync();

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
    isIncompleteSessionLoading ||
    isTodaysWorkoutCompletedLoading
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

  const renderTodayCard = () => {
    if (todaysWorkoutCompleted) {
      return <WorkoutCompleteButton workout={todaysWorkout!} />;
    }
    if (todaysWorkout) {
      return <TodaysWorkoutButton workout={todaysWorkout!} />;
    }
    if (incompleteSession) {
      return <ContinueWorkoutButton session={incompleteSession} />;
    }
    return <NextWorkout nextWorkout={nextWorkout?.workout} />;
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<GymLogo />}
    >
      <HomeHeader />

      {renewalNotice?.shouldShowNotice && (
        <WorkoutRenewalBanner weeksOld={renewalNotice.weeksOld} />
      )}

      {renderTodayCard()}

      <QuickStats
        totalWorkouts={stats.totalWorkouts}
        recentSessions={stats.recentSessions}
        thisWeekSessions={stats.thisWeekSessions}
      />

      <RecentActivity
        recentSession={recentSession}
        onViewHistory={handleViewHistory}
      />

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
