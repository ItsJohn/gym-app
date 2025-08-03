import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useWorkout } from "@/hooks";
import { Session } from "@/validation/session";
interface SessionWithTitle extends Session {
  workout_title?: string;
}

interface SessionCardProps {
  session: SessionWithTitle;
  onPress: () => void;
}
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (startTime: string, endTime?: string) => {
  if (!endTime) return "In progress";

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const minutes = Math.floor(durationMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
};

export function SessionCard({ session, onPress }: SessionCardProps) {
  const { data: workout } = useWorkout(session.workout_id);

  return (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.sessionCardContent}>
        {/* Header with workout title and status */}
        <ThemedView style={styles.sessionHeader}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="subtitle" style={styles.sessionTitle}>
              {workout?.title || "Unknown Workout"}
            </ThemedText>
          </ThemedView>
          <ThemedView
            style={[
              styles.statusBadge,
              session.is_completed
                ? styles.completedBadge
                : styles.incompleteBadge,
            ]}
          >
            <ThemedText
              style={[
                styles.statusText,
                session.is_completed
                  ? styles.completedText
                  : styles.incompleteText,
              ]}
            >
              {session.is_completed ? "✓ Completed" : "⏳ In Progress"}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Session details */}
        <ThemedView style={styles.sessionDetails}>
          {/* Date and time row */}
          <ThemedView style={styles.dateTimeRow}>
            <ThemedView style={styles.dateContainer}>
              <ThemedText style={styles.dateLabel}>Date</ThemedText>
              <ThemedText style={styles.dateValue}>
                {session.started_at
                  ? formatDate(session.started_at)
                  : "Unknown"}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.timeContainer}>
              <ThemedText style={styles.timeLabel}>Time</ThemedText>
              <ThemedText style={styles.timeValue}>
                {session.started_at
                  ? formatTime(session.started_at)
                  : "Unknown"}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Duration row */}
          <ThemedView style={styles.durationRow}>
            <ThemedText style={styles.durationLabel}>Duration</ThemedText>
            <ThemedText style={styles.durationValue}>
              {session.started_at
                ? formatDuration(
                    session.started_at,
                    session.completed_at || undefined,
                  )
                : "Unknown"}
            </ThemedText>
          </ThemedView>

          {/* Notes if available */}
          {session.notes && (
            <ThemedView style={styles.notesContainer}>
              <ThemedText style={styles.notesLabel}>Notes</ThemedText>
              <ThemedText style={styles.notesValue} numberOfLines={2}>
                {session.notes}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sessionCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 4,
  },
  sessionCardContent: {
    padding: 20,
    backgroundColor: "rgba(74, 144, 226, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.08)",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(74, 144, 226, 1)",
    lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 100,
    alignItems: "center",
  },
  completedBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.2)",
  },
  incompleteBadge: {
    backgroundColor: "rgba(255, 152, 0, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.2)",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  completedText: {
    color: "#2E7D32",
  },
  incompleteText: {
    color: "#E65100",
  },
  sessionDetails: {
    gap: 12,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 20,
  },
  dateContainer: {
    flex: 1,
  },
  timeContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 0.7)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 0.7)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.8)",
  },
  timeValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.8)",
  },
  durationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(74, 144, 226, 0.1)",
  },
  durationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  durationValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(74, 144, 226, 1)",
  },
  notesContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(74, 144, 226, 0.1)",
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 0.7)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  notesValue: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.7)",
    fontStyle: "italic",
    lineHeight: 20,
  },
});
