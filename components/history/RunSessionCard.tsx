import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RunSessionService } from "@/database/services/runSessionService";
import { RunSession } from "@/database/types";

interface RunSessionCardProps {
  run: RunSession;
  onPress: () => void;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export function RunSessionCard({ run, onPress }: RunSessionCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>
              🏃 {run.name || "Run"}
            </ThemedText>
            <ThemedText style={styles.date}>
              {formatDate(run.started_at)}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.badge}>
            <ThemedText style={styles.badgeText}>Strava</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.metrics}>
          <ThemedView style={styles.metric}>
            <ThemedText style={styles.metricLabel}>Distance</ThemedText>
            <ThemedText style={styles.metricValue}>
              {RunSessionService.formatDistance(run.distance_m)}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.metric}>
            <ThemedText style={styles.metricLabel}>Pace</ThemedText>
            <ThemedText style={styles.metricValue}>
              {run.avg_pace_secs_per_km
                ? RunSessionService.formatPace(run.avg_pace_secs_per_km)
                : "—"}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.metric}>
            <ThemedText style={styles.metricLabel}>Time</ThemedText>
            <ThemedText style={styles.metricValue}>
              {RunSessionService.formatDuration(run.duration_secs)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 4,
  },
  content: {
    padding: 20,
    backgroundColor: "rgba(252, 76, 2, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(252, 76, 2, 0.15)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FC4C02",
    lineHeight: 24,
  },
  date: {
    fontSize: 13,
    color: "rgba(252, 76, 2, 0.7)",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(252, 76, 2, 0.12)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FC4C02",
  },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(252, 76, 2, 0.12)",
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(252, 76, 2, 0.7)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(0, 0, 0, 0.8)",
  },
});
