import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { WorkoutWithExercises } from "@/database/types";
import { useExercisesByWorkout } from "@/hooks";
import React from "react";
import { StyleSheet } from "react-native";

interface NextWorkoutProps {
  nextWorkout: WorkoutWithExercises | undefined;
}

export function NextWorkout({ nextWorkout }: NextWorkoutProps) {
  const { data: exercises } = useExercisesByWorkout(nextWorkout?.id);

  return (
    <ThemedView style={styles.nextWorkoutContainer}>
      <ThemedText type="subtitle" style={styles.nextWorkoutTitle}>
        Next Workout
      </ThemedText>
      {nextWorkout ? (
        <ThemedView style={styles.nextWorkoutCard}>
          <ThemedText style={styles.workoutTitle}>
            {nextWorkout.title}
          </ThemedText>
          {nextWorkout.description && (
            <ThemedText style={styles.workoutDescription}>
              {nextWorkout.description}
            </ThemedText>
          )}
          <ThemedText style={styles.exerciseCount}>
            {exercises?.length} exercises
          </ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.noWorkoutCard}>
          <ThemedText style={styles.noWorkoutText}>
            No workout scheduled. Set up your 3-day rotation in the Workouts
            tab.
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  nextWorkoutContainer: {
    marginBottom: 32,
  },
  nextWorkoutTitle: {
    marginBottom: 16,
    color: "rgba(74, 144, 226, 1)",
  },
  nextWorkoutCard: {
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.1)",
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "rgba(74, 144, 226, 1)",
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  exerciseCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 1)",
  },
  noWorkoutCard: {
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.1)",
  },
  noWorkoutText: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
});
