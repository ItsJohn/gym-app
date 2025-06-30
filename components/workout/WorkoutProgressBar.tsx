import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet } from "react-native";

interface WorkoutProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function WorkoutProgressBar({
  currentStep,
  totalSteps,
}: WorkoutProgressBarProps) {
  const progress = (currentStep / (totalSteps - 1)) * 100;

  return (
    <ThemedView style={styles.progressContainer}>
      <ThemedView style={styles.progressBar}>
        <ThemedView style={[styles.progressFill, { width: `${progress}%` }]} />
      </ThemedView>
      <ThemedText style={styles.progressText}>
        Step {currentStep + 1} of {totalSteps}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(74, 144, 226, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.7,
  },
});
