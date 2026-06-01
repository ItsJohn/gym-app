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
import RestDayCard from "@/components/home/RestDayCard";
import SchedulePreview from "@/components/home/SchedulePreview";
import TodaysRunButton from "@/components/home/TodaysRunButton";
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
import { useTodaysPlanDay } from "@/hooks/useTrainingPlan";
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
  const { data: todaysPlanDay, isLoading: isPlanDayLoading } =
    useTodaysPlanDay();

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
    isTodaysWorkoutCompletedLoading ||
    isPlanDayLoading
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

  if (stats.totalWorkouts === 0 && !todaysPlanDay) {
    return <EmptyState />;
  }

  // Determine today's primary card based on active training plan
  const renderTodayCard = () => {
    if (todaysPlanDay) {
      const { day } = todaysPlanDay;

      if (day.day_type === "rest") {
        return <RestDayCard />;
      }

      if (day.day_type === "run") {
        return <TodaysRunButton planDay={todaysPlanDay} />;
      }

      // gym day from plan — navigate to the plan's workout by ID
      if (day.day_type === "gym" && day.workout_id) {
        const planWorkout = {
          id: day.workout_id,
          title: day.workout_title ?? "Gym Session",
          description: "Training plan workout",
        } as any;
        return <TodaysWorkoutButton workout={planWorkout} />;
      }
    }

    // No active plan — use existing schedule logic
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
