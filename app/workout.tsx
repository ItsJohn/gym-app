import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet } from "react-native";

import GymLogo from "@/components/GymLogo";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import SingleExerciseStep from "@/components/workout/SingleExerciseStep";
import WorkoutComplete from "@/components/workout/WorkoutComplete";
import WorkoutProgressBar from "@/components/workout/WorkoutProgressBar";
import { useSettings } from "@/contexts/SettingsContext";
import { SessionService } from "@/database/services/sessionService";
import { useExercisesByWorkout, useWorkout } from "@/hooks";
import { Exercise } from "@/validation/schemas";

interface SessionStep {
  type: "exercise" | "complete";
  exercise?: Exercise;
}

export default function WorkoutScreen() {
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
      // TODO: Update set value in session
      console.log(`Set ${setIndex} value changed to:`, value);
    },
    [],
  );

  const handleSetComplete = useCallback((setIndex: number) => {
    // TODO: Complete set in session
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
      // Complete the session in database
      await SessionService.completeSession(
        sessionId,
        "Workout completed successfully",
      );

      // Get session stats for the completion message
      const stats = await SessionService.getSessionStats(parseInt(sessionId));

      Alert.alert(
        "Workout Complete! 🎉",
        `Great job! You completed ${stats.completed_sets} sets with a total of ${Math.round(stats.total_weight)} ${settings.weightUnit} lifted.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Error finishing workout:", err);
      Alert.alert(
        "Workout Complete!",
        "Congratulations on completing your workout!",
        [{ text: "OK", onPress: () => router.back() }],
      );
    }
  }, [sessionId, settings.weightUnit]);

  if (!workoutId) {
    return (
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">No workout ID</ThemedText>
      </ThemedView>
    );
  }

  if (isWorkoutLoading || isExerciseListLoading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={<GymLogo />}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Loading Workout...</ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < sessionSteps.length - 1;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<GymLogo />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.workoutTitle}>
          {workout?.title || "Workout Session"}
        </ThemedText>
        {workout?.description && (
          <ThemedText style={styles.workoutDescription}>
            {workout.description}
          </ThemedText>
        )}
      </ThemedView>

      <WorkoutProgressBar
        currentStep={currentStepIndex}
        totalSteps={sessionSteps.length}
      />

      {currentStep?.type === "exercise" && exerciseList![currentStepIndex] && (
        <SingleExerciseStep
          key={`${currentStepIndex}-${exerciseList![currentStepIndex].name}`}
          exercise={exerciseList![currentStepIndex]}
          showDescription={showDescription}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onToggleDescription={() => setShowDescription(!showDescription)}
          onSetValueChange={handleSetValueChange}
          onSetComplete={handleSetComplete}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}

      {currentStep?.type === "complete" && (
        <WorkoutComplete onFinish={finishWorkout} />
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  workoutTitle: {
    textAlign: "center",
  },
  workoutDescription: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    color: "#ff6b6b",
    marginTop: 8,
  },
});
