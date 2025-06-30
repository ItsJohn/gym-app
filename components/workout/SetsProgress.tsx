import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet } from "react-native";

interface SetsProgressProps {
  completedSets: number;
  totalSets: number;
  setsCompletionStatus: boolean[];
}

export default function SetsProgress({
  completedSets,
  totalSets,
  setsCompletionStatus,
}: SetsProgressProps) {
  return (
    <ThemedView style={styles.setsProgressContainer}>
      <ThemedText style={styles.setsProgressTitle}>
        Sets Progress: {completedSets}/{totalSets}
      </ThemedText>
      <ThemedView style={styles.setsProgressBar}>
        {setsCompletionStatus.map((isCompleted, index) => (
          <ThemedView
            key={index}
            style={[
              styles.setProgressDot,
              isCompleted && styles.setProgressDotCompleted,
            ]}
          />
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  setsProgressContainer: {
    marginBottom: 20,
  },
  setsProgressTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  setsProgressBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  setProgressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(74, 144, 226, 0.3)",
  },
  setProgressDotCompleted: {
    backgroundColor: "#4A90E2",
  },
});
