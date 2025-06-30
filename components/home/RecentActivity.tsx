import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { WorkoutSession } from "@/database/types";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface RecentActivityProps {
  recentSession: WorkoutSession | null;
  onViewHistory: () => void;
}

export function RecentActivity({
  recentSession,
  onViewHistory,
}: RecentActivityProps) {
  return (
    <ThemedView style={styles.activityContainer}>
      <ThemedView style={styles.activityHeader}>
        <ThemedText type="subtitle" style={styles.activityTitle}>
          Recent Activity
        </ThemedText>
        <TouchableOpacity onPress={onViewHistory}>
          <ThemedText style={styles.viewAllText}>View All</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {recentSession ? (
        <ThemedView style={styles.activityCard}>
          <ThemedText style={styles.activityDate}>
            {new Date(recentSession.started_at).toLocaleDateString()}
          </ThemedText>
          <ThemedText style={styles.activityStatus}>
            {recentSession.is_completed ? "✅ Completed" : "⏳ In Progress"}
          </ThemedText>
          {recentSession.notes && (
            <ThemedText style={styles.activityNotes} numberOfLines={2}>
              {recentSession.notes}
            </ThemedText>
          )}
        </ThemedView>
      ) : (
        <ThemedView style={styles.activityCard}>
          <ThemedText style={styles.noActivityText}>
            No recent activity. Start your first workout!
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  activityContainer: {
    marginBottom: 32,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  activityTitle: {
    color: "rgba(74, 144, 226, 1)",
  },
  viewAllText: {
    fontSize: 14,
    color: "rgba(74, 144, 226, 1)",
    fontWeight: "600",
  },
  activityCard: {
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.1)",
  },
  activityDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 1)",
    marginBottom: 4,
  },
  activityStatus: {
    fontSize: 14,
    marginBottom: 8,
  },
  activityNotes: {
    fontSize: 14,
    opacity: 0.8,
    fontStyle: "italic",
  },
  noActivityText: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
});
