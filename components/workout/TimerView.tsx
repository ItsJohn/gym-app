import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import ExerciseHeader from "./ExerciseHeader";

interface TimerViewProps {
  exerciseName: string;
  muscleGroup: string;
  countdownRemaining: number;
  onStopTimer: () => void;
}

export default function TimerView({
  exerciseName,
  muscleGroup,
  countdownRemaining,
  onStopTimer,
}: TimerViewProps) {
  const minutes = Math.floor(countdownRemaining / 60);
  const seconds = countdownRemaining % 60;
  const displayTime =
    minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, "0")}`
      : seconds.toString();

  return (
    <ThemedView style={styles.exerciseContainer}>
      <ExerciseHeader exerciseName={exerciseName} muscleGroup={muscleGroup} />

      <ThemedView style={styles.timerViewContainer}>
        <ThemedText style={styles.timerTitle}>{exerciseName}</ThemedText>

        <ThemedView style={styles.timerDisplay}>
          <ThemedText style={styles.timerText}>{displayTime}</ThemedText>
          <ThemedText style={styles.timerUnit}>
            {minutes > 0 ? "min:sec" : "seconds"}
          </ThemedText>
        </ThemedView>

        <TouchableOpacity style={styles.stopTimerButton} onPress={onStopTimer}>
          <ThemedText style={styles.stopTimerButtonText}>Stop Timer</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.timerInstruction}>
          Timer will auto-complete when it reaches zero
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  exerciseContainer: {
    flex: 1,
  },
  timerViewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
  },
  timerDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 48,
    padding: 16,
    fontWeight: "700",
  },
  timerUnit: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  stopTimerButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  stopTimerButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  timerInstruction: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 20,
    textAlign: "center",
  },
});
