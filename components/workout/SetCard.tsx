import { useCallback, useMemo } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRestTimer } from "@/hooks";
import { useSessionSet, useUpdateSessionSet } from "@/hooks/service";
import { Exercise } from "@/validation/schemas";
import { SessionSet } from "@/validation/sessionSets";

import CompleteButton from "./CompleteButton";
import SetHeader from "./SetHeader";
import SetInput from "./SetInput";

interface SetCardProps {
  setNumber: number;
  exercise: Exercise;
  sessionSetId: number;
  weightUnit?: "kg" | "lbs";
  lastSessionData?: {
    weight?: number;
    reps?: number;
    distance?: number;
  } | null;
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
  if (exercise.type === "distance") {
    return parseInt(sessionSet?.target.distance || "1000", 10);
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
  lastSessionData,
}: Readonly<SetCardProps>) {
  // Create a unique timer ID for this set
  const timerId = `set-${sessionSetId}`;
  const timer = useRestTimer(timerId, exercise.rest_seconds ?? undefined);
  const { mutate: updateSessionSet } = useUpdateSessionSet();
  const { data: sessionSet } = useSessionSet(sessionSetId);

  const isCompleteButtonEnabled = useMemo(() => {
    if (exercise.type === "duration" || exercise.type === "distance") {
      return true;
    }
    const hasWeight =
      sessionSet?.target.weight !== undefined && sessionSet?.target.weight >= 0;
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
      if (exercise.type === "distance") {
        updateSessionSet({
          ...sessionSet,
          target: { ...sessionSet?.target, distance: reps.toString() },
        });
      } else {
        updateSessionSet({
          ...sessionSet,
          target: { ...sessionSet?.target, reps: reps.toString() },
        });
      }
    },
    [sessionSet, updateSessionSet, exercise.type],
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
          <ThemedView style={styles.inputRow}>
            <SetInput
              exercise={exercise}
              weight={sessionSet?.target.weight ?? undefined}
              reps={getReps(exercise, sessionSet)}
              onComplete={handleComplete}
              onWeightChange={handleWeightChange}
              onRepsChange={handleRepsChange}
              weightUnit={weightUnit}
              lastSessionData={lastSessionData}
            />

            <ThemedView style={styles.completeButtonContainer}>
              <CompleteButton
                isCompleted={sessionSet.is_completed}
                isEnabled={!!isCompleteButtonEnabled}
                onComplete={handleComplete}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  setContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  completedSetContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  restingSetContainer: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    borderColor: "rgba(255, 152, 0, 0.3)",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  setInputContainer: {
    marginTop: 12,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  completeButtonContainer: {
    paddingBottom: 8,
  },
  restContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  restTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF9800",
    marginBottom: 8,
    textAlign: "center",
  },
  restMessage: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
    marginBottom: 16,
  },
  skipButton: {
    backgroundColor: "rgba(255, 152, 0, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.3)",
  },
  skipButtonText: {
    color: "#FF9800",
    fontSize: 14,
    fontWeight: "600",
  },
});
