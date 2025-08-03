import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

import GymLogo from "@/components/GymLogo";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AIWorkoutCreator from "@/components/workout-editor/AIWorkoutCreator";
import { ProgramEditor } from "@/components/workout-editor/MultiWorkoutEditor";
import { ToggleCreationType } from "@/components/workout-editor/ToggleCreationType";
import { WorkoutForm } from "@/components/workout-editor/WorkoutForm";
import { WorkoutService } from "@/database/services/workoutService";
import { useCreateExercise, useDeleteExercise } from "@/hooks";
import {
  validateExercise,
  validateWorkout,
  Workout,
} from "@/validation/schemas";

export default function WorkoutEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [workout, setWorkout] = useState<Workout>({
    title: "",
    exercises: [],
    end_date: "",
  });
  const [generatedWorkouts, setGeneratedWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [creationMode, setCreationMode] = useState<"manual" | "ai">(
    isEditing ? "manual" : "ai",
  );
  const [editMode, setEditMode] = useState<"single" | "program">("single");
  const { mutate: createExercise, isPending: isCreatingExercise } =
    useCreateExercise();
  const { mutate: deleteExercise, isPending: isDeletingExercise } =
    useDeleteExercise();

  const loadWorkout = useCallback(async (workoutId: number) => {
    try {
      setIsLoading(true);
      const loadedWorkout =
        await WorkoutService.getWorkoutWithExercises(workoutId);
      if (loadedWorkout) {
        setWorkout(loadedWorkout);
      }
    } catch (err) {
      console.error("Error loading workout:", err);
      Alert.alert("Error", "Failed to load workout");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      loadWorkout(parseInt(id));
    }
  }, [id, isEditing, loadWorkout]);

  const handleAIWorkoutProgramGenerated = useCallback(
    async (workouts: Workout[]) => {
      try {
        console.log("AI Workouts:", workouts);
        setGeneratedWorkouts(workouts);
        setCreationMode("manual");
        setEditMode("program");

        Alert.alert(
          "Workout Program Loaded!",
          `${workouts.length} workout${workouts.length > 1 ? "s" : ""} ${workouts.length > 1 ? "have" : "has"} been generated. You can now review and edit ${workouts.length > 1 ? "them" : "it"} before saving.`,
          [{ text: "OK" }],
        );
      } catch (error) {
        console.error("Error processing AI workout program:", error);
        Alert.alert("Error", "Failed to process AI workout program");
      }
    },
    [],
  );

  const validateWorkoutData = useCallback(
    (workoutData: Workout): string | undefined => {
      const workoutValidation = validateWorkout(workoutData);

      if (!workoutValidation.success) {
        const errorMessages = workoutValidation.error.errors
          .map((err) => {
            const path = err.path.join(".");
            return `${path}: ${err.message}`;
          })
          .join("\n");
        return `Validation failed:\n${errorMessages}`;
      }

      for (let i = 0; i < workoutData.exercises.length; i++) {
        const exercise = workoutData.exercises[i];

        const exerciseValidation = validateExercise(exercise);

        if (!exerciseValidation.success) {
          const errorMessages = exerciseValidation.error.errors
            .map((err) => err.message)
            .join(", ");
          return `Exercise "${exercise.name}" (${i + 1}): ${errorMessages}`;
        }
      }

      return undefined;
    },
    [],
  );

  const handleSave = useCallback(async () => {
    workout.exercises = workout.exercises.map((exercise) => ({
      ...exercise,
      target:
        typeof exercise.target === "string"
          ? JSON.parse(exercise.target)
          : exercise.target,
    }));
    const validationError = validateWorkoutData(workout!);
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }

    try {
      setIsSaving(true);

      if (isEditing) {
        const { exercises, ...rest } = workout!;
        await WorkoutService.updateWorkout(parseInt(id), rest);

        const existingWorkout = await WorkoutService.getWorkoutWithExercises(
          parseInt(id),
        );
        if (existingWorkout) {
          for (const exercise of existingWorkout.exercises) {
            const dbExercise = exercise as any;
            await deleteExercise(dbExercise.id || exercise.id);
          }
        }

        // Add new exercises
        for (let i = 0; i < workout!.exercises.length; i++) {
          const exercise = workout!.exercises[i];
          await createExercise({ ...exercise, workout_id: parseInt(id) });
        }
      } else {
        // Create new workout
        const workoutId = await WorkoutService.createWorkout(workout!);

        // Add exercises
        for (let i = 0; i < workout!.exercises.length; i++) {
          const exercise = workout!.exercises[i];
          exercise.workout_id = workoutId;
          await createExercise({ ...exercise, workout_id: workoutId });
        }
      }

      Alert.alert(
        "Success",
        `Workout ${isEditing ? "updated" : "created"} successfully!`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Error saving workout:", err);
      Alert.alert("Error", "Failed to save workout");
    } finally {
      setIsSaving(false);
    }
  }, [
    validateWorkoutData,
    workout,
    isEditing,
    id,
    deleteExercise,
    createExercise,
  ]);

  if (isLoading) {
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
          <ThemedText type="title">
            {isEditing ? "Edit Workout" : "Create Workout"}
          </ThemedText>

          {!isEditing && (
            <ToggleCreationType
              creationMode={creationMode}
              setCreationMode={setCreationMode}
            />
          )}
        </ThemedView>

        {creationMode === "ai" ? (
          <AIWorkoutCreator
            onWorkoutProgramGenerated={handleAIWorkoutProgramGenerated}
            onCancel={() => setCreationMode("manual")}
          />
        ) : editMode === "program" ? (
          <ProgramEditor
            generatedWorkouts={generatedWorkouts}
            onCancel={() => {
              setEditMode("single");
              setGeneratedWorkouts([]);
            }}
          />
        ) : (
          <ThemedView style={styles.form}>
            <WorkoutForm
              workout={workout}
              onWorkoutChange={setWorkout}
              showTitle={true}
            />

            <ThemedView style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={router.back}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  (isSaving || isCreatingExercise || isDeletingExercise) &&
                    styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={isSaving || isCreatingExercise || isDeletingExercise}
              >
                <ThemedText style={styles.saveButtonText}>
                  {isSaving
                    ? "Saving..."
                    : isCreatingExercise
                      ? "Creating..."
                      : isDeletingExercise
                        ? "Deleting..."
                        : isEditing
                          ? "Update"
                          : "Create"}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        )}
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
    gap: 16,
  },
  form: {
    gap: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
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
