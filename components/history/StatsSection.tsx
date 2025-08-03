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
    // Additional detailed stats
    totalSets?: number;
    completedSets?: number;
    totalExercises?: number;
    totalWeight?: number;
    totalReps?: number;
    exercisesCompleted?: number;
    completionRate?: number;
  };
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

const formatWeight = (weight: number) => {
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(1)}t`;
  }
  return `${weight}kg`;
};

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <ThemedView style={styles.statsSection}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Active Workouts Progress
      </ThemedText>
      <ThemedView style={styles.statsGrid}>
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          subtitle="Workouts"
          color="#4CAF50"
        />
        <StatsCard
          title="Active Workouts"
          value={stats.totalWorkouts}
          subtitle="Created"
          color="#607D8B"
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
        {stats.totalSets !== undefined && (
          <StatsCard
            title="Total Sets"
            value={stats.totalSets}
            subtitle={`${stats.completedSets || 0} completed`}
            color="#9C27B0"
          />
        )}
        {stats.totalExercises !== undefined && (
          <StatsCard
            title="Exercises"
            value={stats.totalExercises}
            subtitle={`${stats.exercisesCompleted || 0} completed`}
            color="#607D8B"
          />
        )}
        {stats.totalWeight !== undefined && stats.totalWeight > 0 && (
          <StatsCard
            title="Total Weight"
            value={formatWeight(stats.totalWeight)}
            subtitle="Lifted"
            color="#FF5722"
          />
        )}
        {stats.totalReps !== undefined && stats.totalReps > 0 && (
          <StatsCard
            title="Total Reps"
            value={stats.totalReps}
            subtitle="Completed"
            color="#795548"
          />
        )}
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
