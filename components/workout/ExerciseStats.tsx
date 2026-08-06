import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { WeightProgressionChart } from "@/components/workout/WeightProgressionChart";
import {
  useExerciseStats,
  useWeightProgression,
} from "@/hooks/useExerciseStats";

interface ExerciseStatsProps {
  exerciseId: string;
  exerciseName: string;
  weightUnit?: "kg" | "lbs";
}

export default function ExerciseStats({
  exerciseId,
  exerciseName,
  weightUnit = "kg",
}: ExerciseStatsProps) {
  const { data: stats, isLoading: isStatsLoading } =
    useExerciseStats(exerciseName);
  const { data: weightData, isLoading: isChartLoading } =
    useWeightProgression(exerciseName);

  if (isStatsLoading || isChartLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="white" />
      </View>
    );
  }

  if (!stats || stats.totalSetsCompleted === 0) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.emptyText}>No historical data yet</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>
            {stats.personalRecord != null
              ? `${stats.personalRecord} ${weightUnit}`
              : "-"}
          </ThemedText>
          <ThemedText style={styles.statLabel}>PR</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>
            {stats.averageWeight != null
              ? `${stats.averageWeight} ${weightUnit}`
              : "-"}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Avg Weight</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>
            {stats.totalSetsCompleted}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Sets Done</ThemedText>
        </View>
      </View>

      {weightData && weightData.length > 0 && (
        <WeightProgressionChart
          data={weightData}
          isLoading={false}
          exerciseName={exerciseName}
          variant="onBlue"
          weightUnit={weightUnit}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    width: "100%",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
  },
});
