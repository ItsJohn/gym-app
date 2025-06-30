import { router } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export const EmptyState = () => {
  const handleStartWorkout = useCallback(() => {
    router.push("/workout-editor");
  }, []);

  return (
    <ThemedView style={styles.emptyState}>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No Workouts Yet
      </ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Create your first workout routine to get started with your fitness
        journey!
      </ThemedText>
      <TouchableOpacity
        style={styles.createFirstButton}
        onPress={handleStartWorkout}
      >
        <ThemedText style={styles.createFirstButtonText}>
          Create Your First Workout
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  emptyDescription: {
    fontSize: 16,
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createFirstButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
});
