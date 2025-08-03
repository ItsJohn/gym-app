import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { WorkoutWithExercises } from "@/database/types";
import { useExercisesByWorkout } from "@/hooks";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

interface NextWorkoutProps {
  nextWorkout: WorkoutWithExercises | undefined;
}

export function NextWorkout({ nextWorkout }: NextWorkoutProps) {
  const { data: exercises } = useExercisesByWorkout(nextWorkout?.id);

  const handleStartWorkout = () => {
    if (!nextWorkout?.id) return;

    router.push({
      pathname: "/workout-preview",
      params: {
        workoutId: nextWorkout.id.toString(),
      },
    });
  };

  return (
    <ThemedView style={styles.nextWorkoutContainer}>
      <ThemedText type="subtitle" style={styles.nextWorkoutTitle}>
        Next Workout
      </ThemedText>
      {nextWorkout ? (
        <ThemedView style={styles.nextWorkoutCard}>
          <ThemedText style={styles.workoutTitle}>
            {nextWorkout.title}
          </ThemedText>
          {nextWorkout.description && (
            <ThemedText style={styles.workoutDescription}>
              {nextWorkout.description}
            </ThemedText>
          )}
          <ThemedText style={styles.exerciseCount}>
            {exercises?.length} exercises
          </ThemedText>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.startButtonText}>
              🏋️ Start Workout
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <ThemedView style={styles.noWorkoutCard}>
          <ThemedText style={styles.noWorkoutText}>
            No workout scheduled. Set up your 3-day rotation in the Workouts
            tab.
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  nextWorkoutContainer: {
    marginBottom: 32,
  },
  nextWorkoutTitle: {
    marginBottom: 16,
    color: "rgba(74, 144, 226, 1)",
  },
  nextWorkoutCard: {
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.1)",
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "rgba(74, 144, 226, 1)",
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  exerciseCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 1)",
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  noWorkoutCard: {
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.1)",
  },
  noWorkoutText: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
});
