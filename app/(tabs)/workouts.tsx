import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Modal, StyleSheet, TouchableOpacity } from "react-native";

import GymLogo from "@/components/GymLogo";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { EmptyState } from "@/components/workout/EmptyState";
import { ScheduleInfo } from "@/components/workout/ScheduleInfo";
import { TrainingPlanSection } from "@/components/workout/TrainingPlanSection";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import WorkoutScheduleManager from "@/components/workout/WorkoutScheduleManager";
import { useActiveWorkouts, useDeleteWorkout } from "@/hooks";
import { Workout } from "@/validation/schemas";

export default function WorkoutsScreen() {
  const [showScheduleManager, setShowScheduleManager] = useState(false);

  // Use hooks instead of direct API calls
  const {
    data: workouts = [],
    isLoading,
    error,
    refetch: loadWorkouts,
  } = useActiveWorkouts();

  const deleteWorkoutMutation = useDeleteWorkout();

  const handleStartWorkout = useCallback((workout: Workout) => {
    if (!workout.id) return;
    router.push({
      pathname: "/workout-preview",
      params: { workoutId: workout.id.toString() },
    });
  }, []);

  const handleEditWorkout = useCallback((workout: Workout) => {
    if (!workout.id) return;
    router.push(`/workout-editor?id=${workout.id}`);
  }, []);

  const handleDeleteWorkout = useCallback(
    (workout: Workout) => {
      if (!workout.id) return;
      Alert.alert(
        "Delete Workout",
        `Are you sure you want to delete "${workout.title}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteWorkoutMutation.mutateAsync(workout.id!);
                // The mutation will automatically invalidate and refetch the workouts
              } catch (err) {
                console.error("Error deleting workout:", err);
                Alert.alert("Error", "Failed to delete workout");
              }
            },
          },
        ],
      );
    },
    [deleteWorkoutMutation],
  );

  const handleCreateWorkout = useCallback(() => {
    router.push("/workout-editor");
  }, []);

  const handleManageSchedule = useCallback(() => {
    setShowScheduleManager(true);
  }, []);

  const handleCloseScheduleManager = useCallback(() => {
    setShowScheduleManager(false);
    loadWorkouts(); // Refresh data when closing
  }, [loadWorkouts]);

  if (isLoading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={<GymLogo />}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title">Loading...</ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  if (error) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={<GymLogo />}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title">Error</ThemedText>
          <ThemedText style={styles.errorText}>
            {error instanceof Error ? error.message : "Failed to load workouts"}
          </ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadWorkouts()}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={<GymLogo />}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.headerTitle}>
              My Workouts
            </ThemedText>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateWorkout}
            >
              <ThemedText style={styles.createButtonText}>
                + Create Workout
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <TrainingPlanSection />

          <ScheduleInfo />

          {workouts.length === 0 ? (
            <EmptyState />
          ) : (
            <ThemedView style={styles.workoutsList}>
              {workouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onPress={() => handleStartWorkout(workout)}
                  onEdit={() => handleEditWorkout(workout)}
                  onDelete={() => handleDeleteWorkout(workout)}
                />
              ))}
            </ThemedView>
          )}
        </ThemedView>
      </ParallaxScrollView>

      <Modal
        visible={showScheduleManager}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <WorkoutScheduleManager onClose={handleCloseScheduleManager} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    flexShrink: 1,
  },
  createButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  createButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
  workoutsList: {
    gap: 16,
  },
  errorText: {
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
