import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useExercisesByWorkout } from "@/hooks";
import { Workout } from "@/validation/schemas";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";

interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function WorkoutCard({
  workout,
  onPress,
  onEdit,
  onDelete,
}: WorkoutCardProps) {
  const { data: exercises } = useExercisesByWorkout(workout.id);
  return (
    <TouchableOpacity style={styles.workoutCard} onPress={onPress}>
      <ThemedView style={styles.workoutCardContent}>
        <ThemedView style={styles.workoutHeader}>
          <ThemedText type="subtitle" style={styles.workoutTitle}>
            {workout.title}
          </ThemedText>
          <ThemedView style={styles.workoutActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <ThemedText
                style={[styles.actionButtonText, styles.deleteButtonText]}
              >
                Delete
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {workout.description && (
          <ThemedText style={styles.workoutDescription}>
            {workout.description}
          </ThemedText>
        )}

        <ThemedView style={styles.workoutStats}>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {exercises?.length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Exercises</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {workout.expected_duration} min
            </ThemedText>
            <ThemedText style={styles.statLabel}>Duration</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            {workout.suggested_playlist ? (
              <Ionicons
                name="musical-notes"
                size={24}
                color="rgba(74, 144, 226, 1)"
              />
            ) : (
              <Ionicons
                name="musical-notes-outline"
                size={24}
                color="rgba(74, 144, 226, 0.3)"
              />
            )}
            <ThemedText style={styles.statLabel}>Playlist</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  workoutCard: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.1)",
  },
  workoutCardContent: {
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.02)",
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  workoutTitle: {
    flex: 1,
    marginRight: 12,
  },
  workoutActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(74, 144, 226, 0.08)",
  },
  deleteButton: {
    backgroundColor: "rgba(255, 107, 107, 0.08)",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 1)",
  },
  deleteButtonText: {
    color: "#ff6b6b",
  },
  workoutDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  workoutStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(74, 144, 226, 0.08)",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "rgba(74, 144, 226, 1)",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
});
