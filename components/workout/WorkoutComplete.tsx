import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface WorkoutCompleteProps {
  onFinish: () => void;
}

export default function WorkoutComplete({ onFinish }: WorkoutCompleteProps) {
  return (
    <ThemedView style={styles.completeContainer}>
      <ThemedText type="title" style={styles.completeTitle}>
        🎉 Workout Complete!
      </ThemedText>
      <ThemedText style={styles.completeMessage}>
        Great job completing your workout! You&apos;ve finished all exercises.
      </ThemedText>

      <TouchableOpacity style={styles.finishButton} onPress={onFinish}>
        <ThemedText style={styles.finishButtonText}>Finish Workout</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  completeContainer: {
    alignItems: "center",
    padding: 40,
  },
  completeTitle: {
    fontSize: 32,
    marginBottom: 16,
    textAlign: "center",
  },
  completeMessage: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 24,
  },
  finishButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
  },
  finishButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
