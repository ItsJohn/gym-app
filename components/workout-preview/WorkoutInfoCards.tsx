import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

interface WorkoutInfoCardsProps {
  exerciseCount: number;
  duration?: number;
}

export default function WorkoutInfoCards({
  exerciseCount,
  duration,
}: WorkoutInfoCardsProps) {
  return (
    <ThemedView style={styles.workoutInfo}>
      <View style={styles.infoCard}>
        <ThemedText type="defaultSemiBold" style={styles.infoNumber}>
          {exerciseCount}
        </ThemedText>
        <ThemedText style={styles.infoLabel}>Exercises</ThemedText>
      </View>
      <View style={styles.infoCard}>
        <ThemedText type="defaultSemiBold" style={styles.infoNumber}>
          {duration ?? "60"}
        </ThemedText>
        <ThemedText style={styles.infoLabel}>Duration</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  workoutInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 12,
    gap: 12,
  },
  infoCard: {
    alignItems: "center",
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    padding: 20,
    borderRadius: 16,
    flex: 1,
  },
  infoNumber: {
    fontSize: 24,
    color: "#4A90E2",
    marginBottom: 4,
    textAlign: "center",
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
});
