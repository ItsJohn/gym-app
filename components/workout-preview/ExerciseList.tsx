import React from "react";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Exercise } from "@/validation/schemas";
import ExerciseListItem from "./ExerciseListItem";

interface ExerciseListProps {
  exercises: Exercise[];
}

export default function ExerciseList({ exercises }: ExerciseListProps) {
  return (
    <ThemedView style={styles.exercisesSection}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        💪 Exercise List
      </ThemedText>

      {exercises.map((exercise, index) => (
        <ExerciseListItem
          key={`${exercise.id}-${index}`}
          exercise={exercise}
          index={index}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  exercisesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
});
