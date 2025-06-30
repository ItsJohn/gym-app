import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface QuickActionsProps {
  onStartWorkout: () => void;
  onManageWorkouts: () => void;
  onViewHistory: () => void;
}

export function QuickActions({
  onStartWorkout,
  onManageWorkouts,
  onViewHistory,
}: QuickActionsProps) {
  return (
    <ThemedView style={styles.actionsContainer}>
      <ThemedText type="subtitle" style={styles.actionsTitle}>
        Quick Actions
      </ThemedText>
      <ThemedView style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={onStartWorkout}
        >
          <ThemedText style={styles.primaryActionText}>
            🏋️ Start Workout
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onManageWorkouts}
        >
          <ThemedText style={styles.actionText}>📝 Manage Workouts</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onViewHistory}>
          <ThemedText style={styles.actionText}>📊 View Progress</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    marginBottom: 32,
  },
  actionsTitle: {
    marginBottom: 16,
    color: "rgba(74, 144, 226, 1)",
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.2)",
    alignItems: "center",
  },
  primaryAction: {
    backgroundColor: "rgba(74, 144, 226, 1)",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 1)",
  },
  primaryActionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
