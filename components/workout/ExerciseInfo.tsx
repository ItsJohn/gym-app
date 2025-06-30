import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Exercise } from "@/validation/schemas";
import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface ExerciseInfoProps {
  exercise: Exercise;
  numberOfSets: number;
  onCustomSetsChange: () => void;
}

export default function ExerciseInfo({
  exercise,
  numberOfSets,
  onCustomSetsChange,
}: ExerciseInfoProps) {
  const targetText = useMemo(() => {
    switch (exercise.type) {
      case "reps":
        return `Target: ${exercise.target.reps} reps`;
      case "reps-sets":
        return `Target: ${exercise.target.reps} reps per set`;
      case "reps-per-side":
        return `Target: ${exercise.target.per_side} reps per side`;
      case "duration":
        return `Target: ${exercise.target.duration}s duration`;
      case "distance":
        return `Target: ${exercise.target.distance}m distance`;
      default:
        return "";
    }
  }, [exercise.type, exercise.target]);

  const canEditSets =
    exercise.type === "reps-sets" || exercise.type === "reps-per-side";

  return (
    <ThemedView style={styles.exerciseInfo}>
      <ThemedText style={styles.targetText}>{targetText}</ThemedText>
      {canEditSets && (
        <TouchableOpacity
          onPress={onCustomSetsChange}
          style={styles.editSetsButton}
        >
          <ThemedText style={styles.editSetsText}>
            {numberOfSets} sets (tap to edit)
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  exerciseInfo: {
    marginBottom: 20,
    alignItems: "center",
  },
  targetText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  editSetsButton: {
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.3)",
  },
  editSetsText: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "500",
  },
});
