import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { WorkoutService } from "@/database/services/workoutService";
import {
  validateExercise,
  validateWorkout,
  Workout,
} from "@/validation/schemas";

import { ExerciseService } from "@/database/services/exerciseService";
import { WorkoutForm } from "./WorkoutForm";

interface ProgramEditorProps {
  generatedWorkouts: Workout[];
  onCancel: () => void;
}

export function ProgramEditor({
  generatedWorkouts,
  onCancel,
}: ProgramEditorProps) {
  const [workouts, setWorkouts] = useState<Workout[]>(generatedWorkouts);

  const [activeWorkoutIndex, setActiveWorkoutIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleWorkoutChange = useCallback(
    (index: number, updatedWorkout: Workout) => {
      setWorkouts((prev) =>
        prev.map((workout, i) => (i === index ? updatedWorkout : workout)),
      );
    },
    [],
  );

  const validateWorkoutInput = useCallback(
    (workout: Workout): string | null => {
      const workoutValidation = validateWorkout(workout);
      if (!workoutValidation.success) {
        const errorMessages = workoutValidation.error.errors
          .map((err) => {
            const path = err.path.join(".");
            return `${path}: ${err.message}`;
          })
          .join("\n");
        return `Workout "${workout.title}" validation failed:\n${errorMessages}`;
      }

      // Validate each exercise individually
      for (let i = 0; i < workout.exercises.length; i++) {
        const exercise = workout.exercises[i];
        const exerciseValidation = validateExercise(exercise);

        if (!exerciseValidation.success) {
          const errorMessages = exerciseValidation.error.errors
            .map((err) => err.message)
            .join(", ");
          return `Exercise "${exercise.name}" in workout "${workout.title}": ${errorMessages}`;
        }
      }

      return null;
    },
    [],
  );

  const handleSaveProgram = useCallback(async () => {
    // Validate all workouts first
    for (const workout of workouts) {
      const validationError = validateWorkoutInput(workout);
      if (validationError) {
        Alert.alert("Validation Error", validationError);
        return;
      }
    }

    // Check if there are existing active workouts that will be deprecated
    const existingActiveWorkouts = await WorkoutService.getActiveWorkouts();
    const hasExistingWorkouts = existingActiveWorkouts.length > 0;

    if (hasExistingWorkouts) {
      Alert.alert(
        "Replace Existing Workouts",
        `You have ${existingActiveWorkouts.length} active workout${existingActiveWorkouts.length > 1 ? "s" : ""} that will be marked as inactive when you save this new program. This action cannot be undone. Continue?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Replace",
            style: "destructive",
            onPress: () => saveProgramWithDeprecation(),
          },
        ],
      );
    } else {
      await saveProgramWithDeprecation();
    }
  }, [validateWorkoutInput, workouts, saveProgramWithDeprecation]);

  const saveProgramWithDeprecation = useCallback(async () => {
    try {
      setIsSaving(true);

      // Deprecate all existing active workouts
      await WorkoutService.deprecateAllActiveWorkouts();

      // Save all new workouts
      for (const workout of workouts) {
        // Create workout
        const workoutId = await WorkoutService.createWorkout(workout);

        // Add exercises
        for (let i = 0; i < workout.exercises.length; i++) {
          const exercise = workout.exercises[i];
          exercise.workout_id = workoutId;
          await ExerciseService.createExercise(exercise);
        }
      }

      const programName =
        workouts.length === 1
          ? "workout"
          : `${workouts.length}-workout program`;
      Alert.alert(
        "Success",
        `Your ${programName} has been created successfully! All previous workouts have been marked as inactive.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Error saving workout program:", err);
      Alert.alert("Error", "Failed to save workout program");
    } finally {
      setIsSaving(false);
    }
  }, [workouts]);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Edit Workout Program</ThemedText>
        <ThemedText style={styles.subtitle}>
          {workouts.length} workout{workouts.length > 1 ? "s" : ""} generated.
          Review and edit before saving.
        </ThemedText>
      </ThemedView>

      {/* Workout Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
      >
        <ThemedView style={styles.tabs}>
          {workouts.map((workout, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tab,
                activeWorkoutIndex === index && styles.activeTab,
              ]}
              onPress={() => setActiveWorkoutIndex(index)}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeWorkoutIndex === index && styles.activeTabText,
                ]}
              >
                {workout.title || `Day ${index + 1}`}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ScrollView>

      {/* Active Workout Form */}
      <ScrollView style={styles.formContainer}>
        <WorkoutForm
          workout={workouts[activeWorkoutIndex]}
          onWorkoutChange={(updatedWorkout) =>
            handleWorkoutChange(activeWorkoutIndex, updatedWorkout)
          }
          showTitle={true}
        />
      </ScrollView>

      {/* Actions */}
      <ThemedView style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.saveButton,
            isSaving && styles.disabledButton,
          ]}
          onPress={handleSaveProgram}
          disabled={isSaving}
        >
          <ThemedText style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save Program"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  tabsContainer: {
    maxHeight: 50,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    minWidth: 80,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "rgba(74, 144, 226, 1)",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 1)",
  },
  activeTabText: {
    color: "white",
  },
  formContainer: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  saveButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.7)",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
