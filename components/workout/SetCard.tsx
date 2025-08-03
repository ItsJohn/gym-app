import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRestTimer, useSessionSet, useUpdateSessionSet } from "@/hooks";
import { Exercise } from "@/validation/schemas";
import { SessionSet } from "@/validation/sessionSets";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import CompleteButton from "./CompleteButton";
import SetHeader from "./SetHeader";
import SetInput from "./SetInput";

interface SetCardProps {
  setNumber: number;
  exercise: Exercise;
  weightUnit?: "kg" | "lbs";
  sessionSetId: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getReps = (
  exercise: Exercise,
  sessionSet?: SessionSet,
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

export default function SetCard({
  setNumber,
  exercise,
  sessionSetId,
  weightUnit = "kg",
}: SetCardProps) {
  const timer = useRestTimer(exercise.rest_seconds ?? undefined);
  const { mutate: updateSessionSet } = useUpdateSessionSet();
  const { data: sessionSet } = useSessionSet(sessionSetId);

  const isCompleteButtonEnabled = useMemo(() => {
    if (exercise.type === "duration" || exercise.type === "distance") {
      return true;
    }
    const hasWeight =
      sessionSet?.target.weight && sessionSet?.target.weight > 0;
    const hasReps =
      sessionSet?.target.reps && getReps(exercise, sessionSet)! > 0;
    return !!(hasWeight && hasReps);
  }, [exercise, sessionSet]);

  const handleWeightChange = useCallback(
    (weight: number) => {
      updateSessionSet({
        ...sessionSet,
        target: { ...sessionSet?.target, weight },
      });
    },
    [sessionSet, updateSessionSet],
  );

  const handleRepsChange = useCallback(
    (reps: number) => {
      updateSessionSet({
        ...sessionSet,
        target: { ...sessionSet?.target, reps: reps.toString() },
      });
    },
    [sessionSet, updateSessionSet],
  );

  const handleComplete = useCallback(() => {
    updateSessionSet({ ...sessionSet, is_completed: true });
    timer.start();
  }, [sessionSet, updateSessionSet, timer]);

  if (!sessionSet) {
    return (
      <ThemedView style={[styles.setContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <ThemedText style={styles.loadingText}>Loading set data...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.setContainer,
        sessionSet?.is_completed && styles.completedSetContainer,
        timer.isActive && styles.restingSetContainer,
      ]}
    >
      <SetHeader setNumber={setNumber} exercise={exercise} />

      {timer.isActive && timer.timeRemaining !== undefined ? (
        <ThemedView style={styles.restContainer}>
          <ThemedText style={styles.restTitle}>Rest Time</ThemedText>
          <ThemedText style={styles.restTimer}>
            {formatTime(timer.timeRemaining)}
          </ThemedText>
          <ThemedText style={styles.restMessage}>
            Take a break before your next set
          </ThemedText>
          <TouchableOpacity style={styles.skipButton} onPress={timer.skip}>
            <ThemedText style={styles.skipButtonText}>Skip Rest</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <ThemedView
          style={styles.setInputContainer}
          lightColor="transparent"
          darkColor="transparent"
        >
          <SetInput
            exercise={exercise}
            weight={sessionSet?.target.weight ?? undefined}
            reps={getReps(exercise, sessionSet)}
            onComplete={handleComplete}
            onWeightChange={handleWeightChange}
            onRepsChange={handleRepsChange}
            weightUnit={weightUnit}
          />

          <ThemedView style={styles.checkButtonWrapper}>
            <CompleteButton
              isCompleted={sessionSet.is_completed}
              isEnabled={!!isCompleteButtonEnabled}
              onComplete={handleComplete}
            />
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  setContainer: {
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.2)",
  },
  completedSetContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  restingSetContainer: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderColor: "rgba(255, 193, 7, 0.3)",
  },
  setInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  checkButtonWrapper: {
    justifyContent: "center",
    alignItems: "baseline",
    paddingTop: 25,
  },
  restContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  restTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF9800",
    marginBottom: 8,
  },
  restMessage: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 12,
  },
  skipButton: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  skipButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
});
