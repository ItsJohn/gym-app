import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet } from "react-native";

interface QuickStatsProps {
  totalWorkouts: number;
  recentSessions: number;
  thisWeekSessions: number;
}

export function QuickStats({
  totalWorkouts,
  recentSessions,
  thisWeekSessions,
}: QuickStatsProps) {
  return (
    <ThemedView style={styles.statsContainer}>
      <ThemedText type="subtitle" style={styles.statsTitle}>
        Quick Stats
      </ThemedText>
      <ThemedView style={styles.statsGrid}>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{totalWorkouts}</ThemedText>
          <ThemedText style={styles.statLabel}>Workouts</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{recentSessions}</ThemedText>
          <ThemedText style={styles.statLabel}>Sessions</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{thisWeekSessions}</ThemedText>
          <ThemedText style={styles.statLabel}>This Week</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    marginBottom: 32,
  },
  statsTitle: {
    marginBottom: 16,
    color: "rgba(74, 144, 226, 1)",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.1)",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "rgba(74, 144, 226, 1)",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: "center",
  },
});
