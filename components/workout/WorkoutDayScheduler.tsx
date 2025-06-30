import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { WorkoutScheduleService } from "@/database/services/workoutScheduleService";
import { WorkoutService } from "@/database/services/workoutService";
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  Workout,
  WorkoutWithDay,
} from "@/database/types";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from "react-native";

interface WorkoutDaySchedulerProps {
  onScheduleChange?: () => void;
}

export function WorkoutDayScheduler({
  onScheduleChange,
}: WorkoutDaySchedulerProps) {
  const [workoutsWithDays, setWorkoutsWithDays] = useState<WorkoutWithDay[]>(
    [],
  );
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [workoutsWithDaysData, allWorkoutsData] = await Promise.all([
        WorkoutScheduleService.getAllWorkoutsWithDays(),
        WorkoutService.getAllWorkouts(),
      ]);

      setWorkoutsWithDays(workoutsWithDaysData);
      setAllWorkouts(allWorkoutsData);
    } catch (error) {
      console.error("Error loading workout schedule data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignWorkoutToDay = async (
    dayOfWeek: DayOfWeek,
    workout: Workout,
  ) => {
    try {
      await WorkoutScheduleService.setWorkoutForDayOfWeek(
        dayOfWeek,
        workout.id,
      );
      await loadData();
      onScheduleChange?.();

      Alert.alert(
        "Success",
        `${workout.title} has been assigned to ${DAYS_OF_WEEK[dayOfWeek]}`,
      );
    } catch (error) {
      console.error("Error assigning workout to day:", error);
      Alert.alert("Error", "Failed to assign workout to day");
    }
  };

  const handleRemoveWorkoutFromDay = async (dayOfWeek: DayOfWeek) => {
    try {
      await WorkoutScheduleService.removeWorkoutFromDayOfWeek(dayOfWeek);
      await loadData();
      onScheduleChange?.();

      Alert.alert("Success", `Workout removed from ${DAYS_OF_WEEK[dayOfWeek]}`);
    } catch (error) {
      console.error("Error removing workout from day:", error);
      Alert.alert("Error", "Failed to remove workout from day");
    }
  };

  const getWorkoutForDay = (
    dayOfWeek: DayOfWeek,
  ): WorkoutWithDay | undefined => {
    return workoutsWithDays.find((w) => w.dayOfWeek === dayOfWeek);
  };

  const showWorkoutSelector = (dayOfWeek: DayOfWeek) => {
    Alert.alert(
      `Assign Workout to ${DAYS_OF_WEEK[dayOfWeek]}`,
      "Choose a workout for this day:",
      [
        ...allWorkouts.map((workout) => ({
          text: workout.title,
          onPress: () => handleAssignWorkoutToDay(dayOfWeek, workout),
        })),
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading schedule...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Weekly Workout Schedule
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Assign workouts to specific days of the week
      </ThemedText>

      <ScrollView style={styles.daysContainer}>
        {DAYS_OF_WEEK.map((dayName, index) => {
          const dayOfWeek = index as DayOfWeek;
          const assignedWorkout = getWorkoutForDay(dayOfWeek);
          const isToday = new Date().getDay() === dayOfWeek;

          return (
            <ThemedView
              key={dayOfWeek}
              style={[styles.dayCard, isToday && styles.todayCard]}
            >
              <ThemedView style={styles.dayHeader}>
                <ThemedText
                  style={[styles.dayName, isToday && styles.todayText]}
                >
                  {dayName}
                  {isToday && " (Today)"}
                </ThemedText>
              </ThemedView>

              {assignedWorkout ? (
                <ThemedView style={styles.workoutInfo}>
                  <ThemedText style={styles.workoutTitle}>
                    {assignedWorkout.title}
                  </ThemedText>
                  {assignedWorkout.description && (
                    <ThemedText style={styles.workoutDescription}>
                      {assignedWorkout.description}
                    </ThemedText>
                  )}
                  <ThemedView style={styles.workoutActions}>
                    <TouchableOpacity
                      style={styles.changeButton}
                      onPress={() => showWorkoutSelector(dayOfWeek)}
                    >
                      <ThemedText style={styles.changeButtonText}>
                        Change
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveWorkoutFromDay(dayOfWeek)}
                    >
                      <ThemedText style={styles.removeButtonText}>
                        Remove
                      </ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>
              ) : (
                <TouchableOpacity
                  style={styles.addWorkoutButton}
                  onPress={() => showWorkoutSelector(dayOfWeek)}
                >
                  <ThemedText style={styles.addWorkoutText}>
                    + Add Workout
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.defaultScheduleButton}
        onPress={async () => {
          try {
            await WorkoutScheduleService.initializeDefault3DaySchedule();
            await loadData();
            onScheduleChange?.();
            Alert.alert(
              "Success",
              "Default 3-day schedule (Mon/Wed/Fri) has been set up",
            );
          } catch (error) {
            Alert.alert("Error", "Failed to set up default schedule");
          }
        }}
      >
        <ThemedText style={styles.defaultScheduleText}>
          Set Default 3-Day Schedule (Mon/Wed/Fri)
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    color: "rgba(74, 144, 226, 1)",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 24,
  },
  daysContainer: {
    flex: 1,
  },
  dayCard: {
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.1)",
  },
  todayCard: {
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderColor: "rgba(74, 144, 226, 0.3)",
  },
  dayHeader: {
    marginBottom: 12,
  },
  dayName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "rgba(74, 144, 226, 1)",
  },
  todayText: {
    color: "rgba(74, 144, 226, 1)",
  },
  workoutInfo: {
    gap: 8,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  workoutDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  workoutActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  changeButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  removeButton: {
    backgroundColor: "rgba(239, 68, 68, 1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  addWorkoutButton: {
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(74, 144, 226, 0.3)",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  addWorkoutText: {
    color: "rgba(74, 144, 226, 1)",
    fontSize: 16,
    fontWeight: "600",
  },
  defaultScheduleButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  defaultScheduleText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
