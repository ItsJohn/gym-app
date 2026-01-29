import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import ExerciseDescription from "./ExerciseDescription";
import ExerciseStats from "./ExerciseStats";

interface ExerciseHeaderProps {
  exerciseName: string;
  notes?: string;
  videoUrl?: string;
  muscleGroup?: string;
  exerciseId?: string;
  weightUnit?: "kg" | "lbs";
}

export default function ExerciseHeader({
  exerciseName,
  notes,
  videoUrl,
  muscleGroup,
  exerciseId,
  weightUnit,
}: ExerciseHeaderProps) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <ThemedView style={styles.exerciseHeader}>
      <ThemedText type="title" style={styles.exerciseName}>
        {exerciseName}
      </ThemedText>
      <ThemedText style={styles.muscleGroup}>{muscleGroup}</ThemedText>

      <TouchableOpacity
        style={styles.descriptionButton}
        onPress={() => setShowDescription(!showDescription)}
      >
        <ThemedText style={styles.descriptionButtonText}>
          {showDescription ? "Hide" : "Show"} Exercise Info
        </ThemedText>
      </TouchableOpacity>

      {showDescription && (
        <>
          {notes && (
            <ExerciseDescription
              description={notes}
              videoUrl={videoUrl}
              isVisible={showDescription}
            />
          )}
          {exerciseId && (
            <ExerciseStats
              exerciseId={exerciseId}
              exerciseName={exerciseName}
              weightUnit={weightUnit}
            />
          )}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  exerciseHeader: {
    backgroundColor: "#4A90E2",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  muscleGroup: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
  },
  descriptionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  descriptionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
