import React from "react";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

interface WorkoutHeaderProps {
  title: string;
  description?: string;
}

export default function WorkoutHeader({
  title,
  description,
}: WorkoutHeaderProps) {
  return (
    <ThemedView style={styles.titleContainer}>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      {description && (
        <ThemedText style={styles.description}>{description}</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    opacity: 0.7,
    marginTop: 8,
    fontSize: 16,
  },
});
