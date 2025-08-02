import { ThemedView } from "@/components/ThemedView";
import { useSessionSetByExerciseId } from "@/hooks/sessionSet";
import { Exercise } from "@/validation/schemas";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import ExerciseHeader from "./ExerciseHeader";
import ExerciseInfo from "./ExerciseInfo";
import SetCard from "./SetCard";
import WorkoutNavigation from "./WorkoutNavigation";

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

export default function SingleExerciseStep({
  exercise,
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
  weightUnit = "kg",
}: SingleExerciseStepProps) {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data: sessionSets, isLoading: isSessionSetLoading } =
    useSessionSetByExerciseId(parseInt(sessionId), exercise.id!);

  // const handleCustomSetsChange = useCallback(() => {
  //   if (exercise.type !== "reps-sets" && exercise.type !== "reps-per-side") {
  //     return;
  //   }

  //   Alert.prompt(
  //     "Number of Sets",
  //     `How many sets would you like to do for ${exercise.name}?`,
  //     (text) => {
  //       const newSets = parseInt(text || "3", 10);
  //       if (newSets > 0 && newSets <= 10) {
  //         // setCustomSets(newSets);
  //         // Update sets data array
  //         // setSetsData((prev) => {
  //         //   const newSetsData = Array(newSets)
  //         //     .fill(null)
  //         //     .map(
  //         //       (_, index) =>
  //         //         (prev && prev[index]) || {
  //         //           weight: undefined,
  //         //           reps:
  //         //             exercise.type === "duration"
  //         //               ? parseInt(exercise.target.duration || "30", 10)
  //         //               : undefined,
  //         //           isCompleted: false,
  //         //           countdownRemaining: undefined,
  //         //           isCountingDown: false,
  //         //           isResting: false,
  //         //           restTimeRemaining: undefined,
  //         //         },
  //         //     );
  //           // return newSetsData;
  //         // });
  //       } else {
  //         Alert.alert(
  //           "Invalid Input",
  //           "Please enter a number between 1 and 10",
  //         );
  //       }
  //     },
  //     "plain-text",
  //     // customSets.toString(),
  //   );
  // }, [exercise.type, exercise.name, exercise.target.duration]);

  const handleNext = useCallback(() => {
    onNext();
  }, [onNext]);

  // const activeTimerIndex = useMemo(() => {
  //   return setsData?.findIndex((set) => set.isCountingDown) ?? -1;
  // }, [setsData]);

  // const isTimerActive = activeTimerIndex !== -1;

  return (
    <ThemedView style={styles.exerciseContainer}>
      {isSessionSetLoading ? (
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
            numberOfSets={sessionSets?.length ?? 0}
            // onCustomSetsChange={handleCustomSetsChange}
          />

          <ThemedView style={styles.setsContainer}>
            {sessionSets?.map((set, setIndex) => (
              <SetCard
                key={setIndex}
                setNumber={setIndex + 1}
                exercise={exercise}
                sessionSetId={set.id!}
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
