import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { ExerciseFormData } from "./types";

interface ExerciseCardProps {
  exercise: ExerciseFormData;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExerciseCard({
  exercise,
  onEdit,
  onDelete,
}: ExerciseCardProps) {
  return (
    <ThemedView style={styles.exerciseCard}>
      <ThemedView style={styles.exerciseHeader}>
        <ThemedText type="subtitle" style={styles.exerciseName}>
          {exercise.name}
        </ThemedText>
        <ThemedView style={styles.exerciseActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={onDelete}
          >
            <ThemedText
              style={[styles.actionButtonText, styles.deleteButtonText]}
            >
              Delete
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.exerciseDetails}>
        <ThemedText style={styles.exerciseDetail}>
          {exercise.type === "reps-sets"
            ? `${exercise.target.sets || "1"} sets × ${exercise.target.reps || "10"} reps`
            : exercise.type === "reps"
              ? `${exercise.target.reps || "10"} reps`
              : exercise.type === "reps-per-side"
                ? `${exercise.target.per_side || "10"} reps per side`
                : exercise.type === "duration"
                  ? `${exercise.target.duration || "30"} seconds`
                  : exercise.type === "distance"
                    ? `${exercise.target.distance || "100"} meters`
                    : "Unknown exercise type"}
        </ThemedText>
        <ThemedText style={styles.exerciseDetail}>
          {exercise.muscle_group} • {exercise.difficulty}
        </ThemedText>
        <ThemedText style={styles.exerciseDetail}>
          Rest: {exercise.rest_seconds ?? 90}s
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.1)",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  exerciseName: {
    flex: 1,
    marginRight: 12,
  },
  exerciseActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
  },
  deleteButton: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 1)",
  },
  deleteButtonText: {
    color: "#ff6b6b",
  },
  exerciseDetails: {
    gap: 4,
  },
  exerciseDetail: {
    fontSize: 14,
    opacity: 0.8,
  },
});
