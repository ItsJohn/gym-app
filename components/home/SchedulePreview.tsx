import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { DAYS_OF_WEEK, DayOfWeek } from "@/database/types";
import { useWorkouts } from "@/hooks";
import { Workout } from "@/validation/schemas";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface UserSchedule {
  workout?: Workout;
  dayName: string;
  date: string;
  isCompleted?: boolean;
}

interface SchedulePreviewProps {
  onViewAllPress?: () => void;
}

export default function SchedulePreview({
  onViewAllPress,
}: SchedulePreviewProps) {
  const [schedule, setSchedule] = useState<UserSchedule[] | null>(null);
  const { data: workouts, isLoading: isWorkoutsLoading } = useWorkouts();

  const loadWeekSchedule = useCallback(async () => {
    try {
      let date = new Date();
      const scheduleItems: UserSchedule[] = [];

      const workoutDays = workouts?.reduce(
        (acc, workout) => ({
          ...acc,
          [workout.day_of_week as DayOfWeek]: workout,
        }),
        {} as Record<DayOfWeek, Workout>,
      );

      const dayNumber = date.getDay();

      for (let i = dayNumber; i < dayNumber + 3; i++) {
        const day = DAYS_OF_WEEK[i % 7];

        date.setDate(date.getDate() + (i - dayNumber));

        const formattedDate = date
          .toLocaleDateString("en-IE", {
            day: "numeric",
            month: "short",
          })
          .replace(" ", "-");

        if (workoutDays && workoutDays[day]) {
          scheduleItems.push({
            workout: workoutDays[day],
            dayName: day,
            date: formattedDate,
            isCompleted: false,
          });
        } else {
          scheduleItems.push({
            workout: undefined,
            dayName: day,
            date: formattedDate,
            isCompleted: undefined,
          });
        }

        // let workout: WorkoutWithExercises | null = null;
        // try {
        //   workout = await WorkoutScheduleService.getWorkoutForDayOfWeek(dayOfWeek);
        // } catch (workoutError) {
        //   console.error(`Error getting workout for ${DAYS_OF_WEEK[dayOfWeek]}:`, workoutError);
        // }
        // console.log('workout', workout);

        // // Check if workout is completed today
        // let isCompleted = false;
        // if (workout && i === 0) { // Only check completion for today
        //   try {
        //     const sessions = await SessionService.getSessionsByWorkoutId(workout.id!);
        //     const todayStart = new Date(today);
        //     todayStart.setHours(0, 0, 0, 0);
        //     const todayEnd = new Date(today);
        //     todayEnd.setHours(23, 59, 59, 999);

        //     isCompleted = sessions.some(session => {
        //       const sessionDate = new Date(session.started_at);
        //       return session.is_completed &&
        //              sessionDate >= todayStart &&
        //              sessionDate <= todayEnd;
        //     });
        //   } catch (sessionError) {
        //     console.error('Error checking session completion:', sessionError);
        //   }
      }

      // Filter out null values and set the schedule
      setSchedule(scheduleItems);

      // scheduleItems.push({
      //   workout,
      //   dayOfWeek,
      //   dayName: DAYS_OF_WEEK[dayOfWeek],
      //   dayShort: DAYS_OF_WEEK_SHORT[dayOfWeek],
      //   isToday: i === 0,
      //   isCompleted,
      //   date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      // });
      // }
      //   console.log('scheduleItems', scheduleItems);
      //   setWeekSchedule(scheduleItems);
    } catch (error) {
      console.error("Error loading week schedule:", error);
      // Set empty schedule on error
      setSchedule([]);
    }
  }, [workouts]);

  useEffect(() => {
    if (workouts && !schedule) {
      loadWeekSchedule();
    }
  }, [loadWeekSchedule, workouts, schedule]);

  if (isWorkoutsLoading || schedule === null) {
    return (
      <ThemedView style={styles.scheduleSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          📅 This Week
        </ThemedText>
        <ThemedText style={styles.loadingText}>Loading schedule...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.scheduleSection}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        📅 This Week
      </ThemedText>

      {schedule.map((item, index) => (
        <View
          key={index}
          style={[styles.scheduleItem, index === 0 && styles.todayItem]}
        >
          <View style={styles.scheduleDay}>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.dayText, index === 0 && styles.todayText]}
            >
              {index === 0 ? "Today" : item.dayName}
            </ThemedText>
            <ThemedText
              style={[styles.scheduleDate, index === 0 && styles.todayText]}
            >
              {item.date}
            </ThemedText>
          </View>
          <View style={styles.scheduleWorkout}>
            <ThemedText
              type="default"
              style={[styles.workoutText, index === 0 && styles.todayText]}
            >
              {item.workout ? item.workout.title : "Rest Day"}
            </ThemedText>
            <View
              style={[
                styles.workoutDot,
                {
                  backgroundColor:
                    index === 0
                      ? item.isCompleted
                        ? "#4CAF50"
                        : "#2196F3" // Green if completed, blue if not
                      : "#9E9E9E", // Gray for future days
                },
              ]}
            />
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.viewAllButton} onPress={onViewAllPress}>
        <ThemedText style={styles.viewAllText}>View Full Schedule →</ThemedText>
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
  loadingText: {
    textAlign: "center",
    opacity: 0.6,
    fontStyle: "italic",
  },
  emptyState: {
    padding: 20,
    backgroundColor: "rgba(161, 206, 220, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(161, 206, 220, 0.2)",
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 20,
  },
  scheduleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(161, 206, 220, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  todayItem: {
    backgroundColor: "rgba(33, 150, 243, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(33, 150, 243, 0.3)",
  },
  scheduleDay: {
    flex: 1,
  },
  dayText: {
    fontSize: 14,
  },
  todayText: {
    color: "#2196F3",
    fontWeight: "600",
  },
  scheduleDate: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  scheduleWorkout: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workoutText: {
    fontSize: 14,
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
  },
});
