import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { WorkoutService } from "@/database/services/workoutService";
import { useCreateExercise, useDeleteExercise } from "@/hooks";
import {
  validateExercise,
  validateWorkout,
  Workout,
  WorkoutGoals,
} from "@/validation/schemas";
import { AIWorkoutResult } from "@/components/workout-editor/AIWorkoutCreator";

export function useWorkoutEditor() {
  const { id, regenerate } = useLocalSearchParams<{
    id?: string;
    regenerate?: string;
  }>();
  const isEditing = !!id;
  const isRegenerating = regenerate === "true";

  const [aiInitialValues, setAiInitialValues] = useState<
    | {
        goals: string;
        issues: string;
        experience: "beginner" | "intermediate" | "advanced";
        timeAvailable: string;
        trainingDaysPerWeek: string;
      }
    | undefined
  >(undefined);
  const [previousProgram, setPreviousProgram] =
    useState<WorkoutGoals["previousProgram"]>(undefined);

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

  useEffect(() => {
    if (!isRegenerating) return;
    (async () => {
      try {
        const latest = await WorkoutService.getLatestActiveWorkout();
        if (!latest?.id) return;
        const withExercises = await WorkoutService.getWorkoutWithExercises(
          latest.id,
        );
        if (!withExercises) return;

        setAiInitialValues({
          goals: latest.ai_goals ?? "Build muscle and strength",
          issues: latest.ai_issues ?? "",
          experience: latest.ai_experience ?? "intermediate",
          timeAvailable: String(latest.ai_time_available ?? 60),
          trainingDaysPerWeek: String(latest.ai_training_days ?? 3),
        });

        setPreviousProgram([
          {
            title: withExercises.title,
            exercises: withExercises.exercises.map((e) => ({
              name: e.name,
              muscle_group: e.muscle_group,
            })),
          },
        ]);
      } catch (err) {
        console.error("Error loading previous workout for regenerate:", err);
      }
    })();
  }, [isRegenerating]);

  const handleAIWorkoutProgramGenerated = useCallback(
    async ({ workouts, goals }: AIWorkoutResult) => {
      try {
        const workoutsWithGoals = workouts.map((w) => ({
          ...w,
          ai_goals: goals.goals,
          ai_issues: goals.issues ?? null,
          ai_experience: goals.experience,
          ai_time_available: goals.timeAvailable,
          ai_training_days: goals.trainingDaysPerWeek,
        }));
        setGeneratedWorkouts(workoutsWithGoals);
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
        const errorMessages = workoutValidation.error.issues
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
          const errorMessages = exerciseValidation.error.issues
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
        await WorkoutService.updateWorkout(parseInt(id!), rest);

        const existingWorkout = await WorkoutService.getWorkoutWithExercises(
          parseInt(id!),
        );
        if (existingWorkout) {
          for (const exercise of existingWorkout.exercises) {
            const dbExercise = exercise as any;
            await deleteExercise(dbExercise.id || exercise.id);
          }
        }

        for (let i = 0; i < workout!.exercises.length; i++) {
          const exercise = workout!.exercises[i];
          await createExercise({ ...exercise, workout_id: parseInt(id!) });
        }
      } else {
        const workoutId = await WorkoutService.createWorkout(workout!);
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

  const isBusy = isSaving || isCreatingExercise || isDeletingExercise;

  return {
    isEditing,
    workout,
    setWorkout,
    generatedWorkouts,
    setGeneratedWorkouts,
    isLoading,
    isSaving,
    isCreatingExercise,
    isDeletingExercise,
    isBusy,
    creationMode,
    setCreationMode,
    editMode,
    setEditMode,
    handleAIWorkoutProgramGenerated,
    handleSave,
    aiInitialValues,
    previousProgram,
  };
}
