import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SessionService } from "@/database/services/sessionService";
import { DAYS_OF_WEEK, DayOfWeek } from "@/database/types";
import { useWorkouts } from "@/hooks";
import { Workout } from "@/validation/schemas";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
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
          // Check if workout is completed for today
          let isCompleted = false;
          if (i === dayNumber) {
            // Only check completion for today
            try {
              const sessions = await SessionService.getSessionsByWorkoutId(
                workoutDays[day].id!,
              );
              const todayStart = new Date();
              todayStart.setHours(0, 0, 0, 0);
              const todayEnd = new Date();
              todayEnd.setHours(23, 59, 59, 999);

              isCompleted = sessions.some((session) => {
                if (!session.started_at) return false;
                const sessionDate = new Date(session.started_at);
                return (
                  session.is_completed &&
                  sessionDate >= todayStart &&
                  sessionDate <= todayEnd
                );
              });
            } catch (sessionError) {
              console.error("Error checking session completion:", sessionError);
            }
          }

          scheduleItems.push({
            workout: workoutDays[day],
            dayName: day,
            date: formattedDate,
            isCompleted,
          });
        } else {
          scheduleItems.push({
            workout: undefined,
            dayName: day,
            date: formattedDate,
            isCompleted: undefined,
          });
        }
      }

      // Filter out null values and set the schedule
      setSchedule(scheduleItems);
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
            {index === 0 && item.isCompleted ? (
              <View style={[styles.workoutDot, { backgroundColor: "#4CAF50" }]}>
                <Ionicons name="checkmark" size={8} color="white" />
              </View>
            ) : (
              <View
                style={[
                  styles.workoutDot,
                  {
                    backgroundColor:
                      index === 0
                        ? "#2196F3" // Blue if not completed
                        : "#9E9E9E", // Gray for future days
                  },
                ]}
              />
            )}
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
    gap: 12,
  },
  todayItem: {
    backgroundColor: "rgba(33, 150, 243, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(33, 150, 243, 0.3)",
  },
  scheduleDay: {
    flex: 0,
    minWidth: 60,
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
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workoutText: {
    fontSize: 14,
    flex: 1,
  },
  workoutDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
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
