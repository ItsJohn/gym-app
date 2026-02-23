import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

import { useSettings } from "@/contexts/SettingsContext";
import { SessionService } from "@/database/services/sessionService";
import { useExercisesByWorkout, useWorkout } from "@/hooks";
import { Exercise } from "@/validation/schemas";

interface SessionStep {
  type: "exercise" | "complete";
  exercise?: Exercise;
}

export function useWorkoutSession() {
  const { settings } = useSettings();
  const { workoutId, sessionId } = useLocalSearchParams<{
    workoutId: string;
    sessionId: string;
  }>();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const { data: workout, isLoading: isWorkoutLoading } = useWorkout(
    parseInt(workoutId),
  );
  const { data: exerciseList, isLoading: isExerciseListLoading } =
    useExercisesByWorkout(parseInt(workoutId));

  const sessionSteps = useMemo(() => {
    const steps: SessionStep[] =
      exerciseList?.map((exercise) => ({ type: "exercise", exercise })) ?? [];
    return [...steps, { type: "complete" }];
  }, [exerciseList]);

  const currentStep = useMemo(
    () => sessionSteps[currentStepIndex],
    [sessionSteps, currentStepIndex],
  );

  const handleSetValueChange = useCallback(
    (setIndex: number, value: string | number) => {
      console.log(`Set ${setIndex} value changed to:`, value);
    },
    [],
  );

  const handleSetComplete = useCallback((setIndex: number) => {
    console.log(`Set ${setIndex} completed`);
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setShowDescription(settings.showExerciseDescriptions);
    }
  }, [currentStepIndex, settings.showExerciseDescriptions]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < sessionSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setShowDescription(settings.showExerciseDescriptions);
    }
  }, [currentStepIndex, sessionSteps, settings.showExerciseDescriptions]);

  const finishWorkout = useCallback(async () => {
    if (!sessionId) return;

    try {
      await SessionService.completeSession(
        sessionId,
        "Workout completed successfully",
      );

      const stats = await SessionService.getSessionStats(parseInt(sessionId));

      Alert.alert(
        "Workout Complete! 🎉",
        `Great job! You completed ${stats.completed_sets} sets with a total of ${Math.round(stats.total_weight)} ${settings.weightUnit} lifted.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Error finishing workout:", err);
      Alert.alert("Error", "Failed to save your workout. Please try again.");
    }
  }, [sessionId, settings.weightUnit]);

  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < sessionSteps.length - 1;
  const isLoading = isWorkoutLoading || isExerciseListLoading;

  return {
    workoutId,
    workout,
    exerciseList,
    isLoading,
    currentStepIndex,
    currentStep,
    sessionSteps,
    showDescription,
    setShowDescription,
    canGoBack,
    canGoForward,
    handleSetValueChange,
    handleSetComplete,
    handlePrevious,
    handleNext,
    finishWorkout,
  };
}
