import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatsCard } from "./StatsCard";

interface StatsSectionProps {
  stats: {
    totalSessions: number;
    completedSessions: number;
    totalDuration: number;
    averageDuration: number;
    totalWorkouts: number;
    currentStreak: number;
  };
}

export function StatsSection({ stats }: StatsSectionProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <ThemedView style={styles.statsSection}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Your Progress
      </ThemedText>
      <ThemedView style={styles.statsGrid}>
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          subtitle="Workouts"
          color="#4CAF50"
        />
        <StatsCard
          title="Completed"
          value={stats.completedSessions}
          subtitle={`${stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}% success`}
          color="#2196F3"
        />
        <StatsCard
          title="Total Time"
          value={formatDuration(stats.totalDuration)}
          subtitle="Training"
          color="#FF9800"
        />
        <StatsCard
          title="Avg Duration"
          value={formatDuration(stats.averageDuration)}
          subtitle="Per session"
          color="#E91E63"
        />
        <StatsCard
          title="Current Streak"
          value={stats.currentStreak}
          subtitle="Days"
          color="#9C27B0"
        />
        <StatsCard
          title="Workouts"
          value={stats.totalWorkouts}
          subtitle="Created"
          color="#607D8B"
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    color: "rgba(74, 144, 226, 1)",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
});
