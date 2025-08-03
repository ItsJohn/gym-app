import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet } from "react-native";

export function ScheduleInfo() {
  return (
    <ThemedView style={styles.scheduleInfo}>
      <ThemedView style={styles.scheduleHeader}>
        <ThemedText type="subtitle" style={styles.scheduleTitle}>
          Weekly Workout Schedule
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scheduleInfo: {
    marginBottom: 24,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  scheduleTitle: {
    flexShrink: 1,
  },
  manageScheduleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
  },
  manageScheduleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 1)",
  },
  currentWorkoutInfo: {
    marginBottom: 12,
  },
  nextWorkoutLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "rgba(74, 144, 226, 1)",
    marginBottom: 4,
  },
  nextWorkoutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgba(74, 144, 226, 1)",
  },
  noWorkoutScheduled: {
    fontSize: 14,
    color: "rgba(74, 144, 226, 0.7)",
  },
});
