import { ThemedView } from "@/components/ThemedView";
import { useMultipleRestTimers } from "@/hooks";
import { useSessionSet, useSessionSetByExerciseId } from "@/hooks/sessionSet";
import { Exercise } from "@/validation/schemas";
import { SessionSet } from "@/validation/sessionSets";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet } from "react-native";
import ExerciseHeader from "./ExerciseHeader";
import ExerciseInfo from "./ExerciseInfo";
import SetCard from "./SetCard";
import TimerView from "./TimerView";
import { SetData } from "./types";
import WorkoutNavigation from "./WorkoutNavigation";
import { useLocalSearchParams } from "expo-router";

interface SingleExerciseStepProps {
  exercise: Exercise;
  showDescription: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onToggleDescription: () => void;
  onSetValueChange: (setIndex: number, value: string | number) => void;
  onSetComplete: (setIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  weightUnit?: "kg" | "lbs";
}

// Extended SetData to include rest state
interface ExtendedSetData extends SetData {
  isResting?: boolean;
  restTimeRemaining?: number;
}

const getReps = (
  exercise: Exercise,
  sessionSet: SessionSet,
): number | undefined => {
  if (exercise.type === "duration") {
    return parseInt(
      sessionSet?.target.duration?.split("-")[0] ??
        sessionSet?.target.duration ??
        "30",
      10,
    );
  }
  if (
    exercise.type === "reps-sets" ||
    exercise.type === "reps-per-side" ||
    exercise.type === "reps"
  ) {
    return parseInt(sessionSet?.target.reps || "10", 10);
  }
};

export default function SingleExerciseStep({
  exercise,
  canGoBack,
  canGoForward,
  onSetValueChange,
  onSetComplete,
  onPrevious,
  onNext,
  weightUnit = "kg",
}: SingleExerciseStepProps) {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data: sessionSets, isLoading: isSessionSetLoading } =
    useSessionSetByExerciseId(parseInt(sessionId), exercise.id!);
  const [setsData, setSetsData] = useState<ExtendedSetData[]>();
  const [timers, setTimers] = useState<{ [key: number]: number | null }>({});
  const multipleRestTimers = useMultipleRestTimers();

  useEffect(() => {
    Object.values(timers).forEach((timer) => {
      if (timer) clearInterval(timer);
    });

    setTimers({});
    setSetsData(
      sessionSets?.map((sessionSet, index) => ({
        weight: undefined,
        reps: getReps(exercise, sessionSet),
        isCompleted: false,
        countdownRemaining: undefined,
        isCountingDown: false,
        isResting: multipleRestTimers.isRestActive(index),
        restTimeRemaining: multipleRestTimers.getRestTime(index),
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.name, exercise.muscle_group, sessionSets]); // Reset when exercise changes

  useEffect(() => {
    return () => {
      Object.values(timers).forEach((timer) => {
        if (timer) clearInterval(timer);
      });
    };
  }, [timers]);

  const handleWeightChange = useCallback((setIndex: number, weight: number) => {
    setSetsData((prev) =>
      prev?.map((set, index) =>
        index === setIndex ? { ...set, weight } : set,
      ),
    );
  }, []);

  const handleRepsChange = useCallback(
    (setIndex: number, reps: number) => {
      setSetsData((prev) =>
        prev?.map((set, index) =>
          index === setIndex
            ? {
                ...set,
                reps,
                countdownRemaining: undefined,
                isCountingDown: false,
              }
            : set,
        ),
      );
      // Call the original callback with reps value for backward compatibility
      onSetValueChange(setIndex, reps);

      // Clear any existing timer for this set
      if (timers[setIndex]) {
        clearInterval(timers[setIndex]!);
        setTimers((prev) => {
          const newTimers = { ...prev };
          delete newTimers[setIndex];
          return newTimers;
        });
      }
    },
    [onSetValueChange, timers],
  );

  const startSetRest = useCallback(
    (setIndex: number) => {
      const restDuration = exercise.rest_seconds || 90; // Default to 90 seconds if not specified

      setSetsData((prev) =>
        prev?.map((set, index) =>
          index === setIndex
            ? { ...set, isResting: true, restTimeRemaining: restDuration }
            : set,
        ),
      );

      // Use the specialized hook to start rest timer
      multipleRestTimers.startRestTimer(setIndex, restDuration);
    },
    [exercise.rest_seconds, multipleRestTimers],
  );

  const skipSetRest = useCallback(
    (setIndex: number) => {
      // Use the specialized hook to skip rest timer
      multipleRestTimers.skipRestTimer(setIndex);

      setSetsData((prev) =>
        prev?.map((set, index) =>
          index === setIndex
            ? { ...set, isResting: false, restTimeRemaining: undefined }
            : set,
        ),
      );
    },
    [multipleRestTimers],
  );

  const handleSetComplete = useCallback(
    (setIndex: number) => {
      setSetsData((prev) =>
        prev?.map((set, index) =>
          index === setIndex
            ? { ...set, isCompleted: !set.isCompleted, isCountingDown: false }
            : set,
        ),
      );
      onSetComplete(setIndex);

      // Clear timer if running
      if (timers[setIndex]) {
        clearInterval(timers[setIndex]!);
        setTimers((prev) => {
          const newTimers = { ...prev };
          delete newTimers[setIndex];
          return newTimers;
        });
      }

      // Check if this isn't the last set and start rest timer
      if (setIndex < customSets - 1) {
        startSetRest(setIndex);
      }
    },
    [onSetComplete, timers, startSetRest],
  );

  const handleCustomSetsChange = useCallback(() => {
    if (exercise.type !== "reps-sets" && exercise.type !== "reps-per-side") {
      return;
    }

    Alert.prompt(
      "Number of Sets",
      `How many sets would you like to do for ${exercise.name}?`,
      (text) => {
        const newSets = parseInt(text || "3", 10);
        if (newSets > 0 && newSets <= 10) {
          setCustomSets(newSets);
          // Update sets data array
          setSetsData((prev) => {
            const newSetsData = Array(newSets)
              .fill(null)
              .map(
                (_, index) =>
                  (prev && prev[index]) || {
                    weight: undefined,
                    reps:
                      exercise.type === "duration"
                        ? parseInt(exercise.target.duration || "30", 10)
                        : undefined,
                    isCompleted: false,
                    countdownRemaining: undefined,
                    isCountingDown: false,
                    isResting: false,
                    restTimeRemaining: undefined,
                  },
              );
            return newSetsData;
          });
        } else {
          Alert.alert(
            "Invalid Input",
            "Please enter a number between 1 and 10",
          );
        }
      },
      "plain-text",
      customSets.toString(),
    );
  }, [exercise.type, exercise.name, exercise.target.duration]);

  const handleNext = useCallback(() => {
    onNext();
  }, [onNext]);

  const activeTimerIndex = useMemo(() => {
    return setsData?.findIndex((set) => set.isCountingDown) ?? -1;
  }, [setsData]);

  const isTimerActive = activeTimerIndex !== -1;

  if (isTimerActive && exercise.type === "duration" && setsData) {
    const activeSet = setsData[activeTimerIndex];
    const countdownRemaining = activeSet?.countdownRemaining || 0;

    return (
      <TimerView
        exerciseName={exercise.name}
        muscleGroup={exercise.muscle_group}
        countdownRemaining={countdownRemaining}
        onStopTimer={() => {
          if (timers[activeTimerIndex]) {
            clearInterval(timers[activeTimerIndex]!);
            setTimers((prev) => {
              const newTimers = { ...prev };
              delete newTimers[activeTimerIndex];
              return newTimers;
            });
          }
        }}
      />
    );
  }

  return (
    <ThemedView style={styles.exerciseContainer}>
      {isSessionSetLoading || !setsData ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </ThemedView>
      ) : (
        <>
          <ExerciseHeader
            exerciseName={exercise.name}
            muscleGroup={exercise.muscle_group}
            notes={exercise.notes ?? undefined}
            videoUrl={exercise.video_url || undefined}
          />

          <ExerciseInfo
            exercise={exercise}
            numberOfSets={setsData?.length}
            onCustomSetsChange={handleCustomSetsChange}
          />

          <ThemedView style={styles.setsContainer}>
            {setsData?.map((set, setIndex) => (
              <SetCard
                key={setIndex}
                setNumber={setIndex + 1}
                exercise={exercise}
                weight={set?.weight}
                reps={set?.reps}
                isCompleted={set?.isCompleted || false}
                isResting={set?.isResting || false}
                restTimeRemaining={set?.restTimeRemaining}
                onWeightChange={(weight) =>
                  handleWeightChange(setIndex, weight)
                }
                onRepsChange={(reps) => handleRepsChange(setIndex, reps)}
                onComplete={() => handleSetComplete(setIndex)}
                onSkipRest={() => skipSetRest(setIndex)}
                weightUnit={weightUnit}
              />
            ))}
          </ThemedView>

          <WorkoutNavigation
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  exerciseContainer: {
    flex: 1,
  },
  setsContainer: {
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
