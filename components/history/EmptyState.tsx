import { router } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export const EmptyState = ({ hasWorkout }: { hasWorkout: boolean }) => {
  const handleStartWorkout = useCallback(() => {
    router.push("/workout");
  }, []);

  const handleCreateWorkout = useCallback(() => {
    router.push("/workout-editor");
  }, []);

  return (
    <ThemedView style={styles.emptyState}>
      <ThemedText style={styles.emptyTitle}>
        {hasWorkout ? "No workouts yet" : "No sessions yet"}
      </ThemedText>
      <ThemedText style={styles.emptyDescription}>
        {hasWorkout
          ? "Create your first workout to see your progress here!"
          : "Start your first workout to see your progress here!"}
      </ThemedText>
      <TouchableOpacity
        style={styles.startWorkoutButton}
        onPress={hasWorkout ? handleCreateWorkout : handleStartWorkout}
      >
        <ThemedText style={styles.startWorkoutButtonText}>
          {hasWorkout
            ? "Create your first workout"
            : "Start your first workout"}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  startWorkoutButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startWorkoutButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
