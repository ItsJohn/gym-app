import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

import GymLogo from "@/components/GymLogo";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ExerciseList from "@/components/workout-preview/ExerciseList";
import StartWorkoutButton from "@/components/workout-preview/StartWorkoutButton";
import WorkoutHeader from "@/components/workout-preview/WorkoutHeader";
import WorkoutInfoCards from "@/components/workout-preview/WorkoutInfoCards";
import { useExercisesByWorkout, useWorkout } from "@/hooks";

export default function WorkoutPreviewScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const { data: workout, isLoading: isWorkoutLoading } = useWorkout(
    parseInt(workoutId),
  );
  const { data: exerciseList, isLoading: isExerciseListLoading } =
    useExercisesByWorkout(parseInt(workoutId));

  if (isWorkoutLoading || isExerciseListLoading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={<GymLogo />}
      >
        <ThemedView style={styles.loadingContainer}>
          <ThemedText type="title">Loading Workout...</ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<GymLogo />}
    >
      <WorkoutHeader
        title={workout!.title}
        description={workout!.description ?? undefined}
      />

      <WorkoutInfoCards
        exerciseCount={exerciseList!.length}
        duration={workout!.expected_duration ?? undefined}
      />

      <ExerciseList exercises={exerciseList!} />

      <StartWorkoutButton />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});
