import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet, View } from "react-native";

interface VisualStatsProps {
  monthlyWorkouts?: number;
  dayStreak?: number;
  caloriesBurned?: string;
  totalTime?: string;
  weeklyWorkouts?: number[];
}

export default function VisualStats({
  monthlyWorkouts = 24,
  dayStreak = 5,
  caloriesBurned = "2.1k",
  totalTime = "8.5h",
  weeklyWorkouts = [3, 4, 2, 5, 3, 4, 6],
}: VisualStatsProps) {
  const maxWorkouts = Math.max(...weeklyWorkouts);

  return (
    <ThemedView style={styles.statsSection}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        📊 This Week&apos;s Progress
      </ThemedText>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            {monthlyWorkouts}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Workouts This Month</ThemedText>
        </View>

        <View style={styles.statCard}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            {dayStreak}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
        </View>

        <View style={styles.statCard}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            {caloriesBurned}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Calories Burned</ThemedText>
        </View>

        <View style={styles.statCard}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            {totalTime}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Total Time</ThemedText>
        </View>
      </View>

      {/* Weekly Activity Chart */}
      <View style={styles.chartContainer}>
        <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
          Weekly Activity
        </ThemedText>
        <View style={styles.chart}>
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <View key={index} style={styles.chartDay}>
              <View
                style={[
                  styles.chartBar,
                  { height: (weeklyWorkouts[index] / maxWorkouts) * 60 },
                ]}
              />
              <ThemedText style={styles.chartLabel}>{day}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    color: "#4A90E2",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
  },

  // Chart
  chartContainer: {
    backgroundColor: "rgba(255, 107, 53, 0.05)",
    padding: 16,
    borderRadius: 12,
  },
  chartTitle: {
    textAlign: "center",
    marginBottom: 12,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 80,
  },
  chartDay: {
    alignItems: "center",
    flex: 1,
  },
  chartBar: {
    width: 20,
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    marginBottom: 8,
    minHeight: 10,
  },
  chartLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
});
