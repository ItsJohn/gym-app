import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  DayOfWeek,
  DAYS_OF_WEEK_SHORT,
  Workout,
  WorkoutSession,
} from "@/database/types";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface WorkoutWithStatus extends Workout {
  isCompleted?: boolean;
  lastSession?: WorkoutSession;
  dayOfWeek?: DayOfWeek;
}

interface SchedulePreviewProps {
  readonly upcomingWorkouts: WorkoutWithStatus[];
  readonly onViewAllPress?: () => void;
}

export default function blah({
  upcomingWorkouts,
  onViewAllPress,
}: SchedulePreviewProps) {
  // Create a weekly schedule view
  const weeklySchedule: { [key in DayOfWeek]?: WorkoutWithStatus } = {};

  upcomingWorkouts.forEach((workout) => {
    if (workout.dayOfWeek !== undefined) {
      weeklySchedule[workout.dayOfWeek] = workout;
    }
  });

  const today = new Date().getDay() as DayOfWeek;

  return (
    <ThemedView style={styles.scheduleSection}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        📅 Weekly Schedule
      </ThemedText>

      <ThemedView style={styles.weekGrid}>
        {DAYS_OF_WEEK_SHORT.map((dayName, index) => {
          const dayOfWeek = index as DayOfWeek;
          const workout = weeklySchedule[dayOfWeek];
          const isToday = dayOfWeek === today;

          return (
            <ThemedView
              key={dayOfWeek}
              style={[
                styles.dayCard,
                isToday && styles.todayCard,
                workout && styles.scheduledCard,
              ]}
            >
              <ThemedText
                style={[
                  styles.dayName,
                  isToday && styles.todayText,
                  workout && styles.scheduledText,
                ]}
              >
                {dayName}
              </ThemedText>

              {workout ? (
                <ThemedView style={styles.workoutInfo}>
                  <ThemedText style={styles.workoutTitle} numberOfLines={2}>
                    {workout.title}
                  </ThemedText>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: workout.isCompleted
                          ? "#22C55E"
                          : "#4A90E2",
                      },
                    ]}
                  />
                </ThemedView>
              ) : (
                <ThemedText style={styles.restDay}>Rest</ThemedText>
              )}
            </ThemedView>
          );
        })}
      </ThemedView>

      {/* Show unscheduled workouts if any */}
      {upcomingWorkouts.some((w) => w.dayOfWeek === undefined) && (
        <ThemedView style={styles.unscheduledSection}>
          <ThemedText style={styles.unscheduledTitle}>
            Unscheduled Workouts:
          </ThemedText>
          {upcomingWorkouts
            .filter((w) => w.dayOfWeek === undefined)
            .slice(0, 3)
            .map((workout) => (
              <View key={workout.id} style={styles.unscheduledItem}>
                <ThemedText style={styles.unscheduledWorkout}>
                  {workout.title}
                </ThemedText>
                <View
                  style={[
                    styles.workoutDot,
                    {
                      backgroundColor: workout.isCompleted
                        ? "#22C55E"
                        : "#4A90E2",
                    },
                  ]}
                />
              </View>
            ))}
        </ThemedView>
      )}

      <TouchableOpacity style={styles.viewAllButton} onPress={onViewAllPress}>
        <ThemedText style={styles.viewAllText}>Manage Schedule →</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scheduleSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  weekGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  dayCard: {
    width: "13%",
    minWidth: 45,
    aspectRatio: 1,
    backgroundColor: "rgba(161, 206, 220, 0.05)",
    borderRadius: 8,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(161, 206, 220, 0.1)",
  },
  todayCard: {
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderColor: "rgba(74, 144, 226, 0.3)",
  },
  scheduledCard: {
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderColor: "rgba(74, 144, 226, 0.2)",
  },
  dayName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
    opacity: 0.7,
  },
  todayText: {
    color: "rgba(74, 144, 226, 1)",
    opacity: 1,
  },
  scheduledText: {
    color: "rgba(74, 144, 226, 1)",
    opacity: 1,
  },
  workoutInfo: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  workoutTitle: {
    fontSize: 8,
    textAlign: "center",
    marginBottom: 2,
    lineHeight: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  restDay: {
    fontSize: 8,
    opacity: 0.5,
    textAlign: "center",
  },
  unscheduledSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(255, 193, 7, 0.05)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.2)",
  },
  unscheduledTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    color: "rgba(255, 193, 7, 0.8)",
  },
  unscheduledItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  unscheduledWorkout: {
    fontSize: 12,
    flex: 1,
  },
  workoutDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  viewAllButton: {
    alignItems: "center",
    marginTop: 8,
  },
  viewAllText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "600",
  },
});
