import { useFont } from "@shopify/react-native-skia";
import React from "react";
import { StyleSheet, View, ActivityIndicator, Pressable } from "react-native";
import { CartesianChart, Bar } from "victory-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { WorkoutFrequencyPoint } from "@/hooks/useAnalyticsData";

interface WorkoutFrequencyChartProps {
  data: WorkoutFrequencyPoint[];
  isLoading: boolean;
  period: "week" | "month";
  onPeriodChange: (period: "week" | "month") => void;
}

const spaceMono = require("@/assets/fonts/SpaceMono-Regular.ttf");

export function WorkoutFrequencyChart({
  data,
  isLoading,
  period,
  onPeriodChange,
}: WorkoutFrequencyChartProps) {
  const colorScheme = useColorScheme() ?? "light";
  const font = useFont(spaceMono, 12);

  if (isLoading || !font) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Workout Frequency</ThemedText>
          <PeriodToggle
            period={period}
            onPeriodChange={onPeriodChange}
            colorScheme={colorScheme}
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      </ThemedView>
    );
  }

  const totalWorkouts = data.reduce((sum, d) => sum + d.count, 0);

  if (totalWorkouts === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Workout Frequency</ThemedText>
          <PeriodToggle
            period={period}
            onPeriodChange={onPeriodChange}
            colorScheme={colorScheme}
          />
        </View>
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            Complete some workouts to see your frequency data
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const chartData = data.map((point, index) => ({
    x: index,
    count: point.count,
  }));

  const barColor = colorScheme === "dark" ? "#60a5fa" : "#3b82f6";

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const avgCount = totalWorkouts / data.length;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Workout Frequency</ThemedText>
        <PeriodToggle
          period={period}
          onPeriodChange={onPeriodChange}
          colorScheme={colorScheme}
        />
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{totalWorkouts}</ThemedText>
          <ThemedText style={styles.statLabel}>Total</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>
            {avgCount.toFixed(1)}
          </ThemedText>
          <ThemedText style={styles.statLabel}>
            Avg/{period === "week" ? "wk" : "mo"}
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{maxCount}</ThemedText>
          <ThemedText style={styles.statLabel}>
            Best {period === "week" ? "wk" : "mo"}
          </ThemedText>
        </View>
      </View>
      <View style={styles.chartContainer}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={["count"] as const}
          domainPadding={{ left: 20, right: 20, top: 20 }}
          axisOptions={{ font }}
        >
          {({ points, chartBounds }) => (
            <Bar
              points={points.count}
              chartBounds={chartBounds}
              color={barColor}
              roundedCorners={{ topLeft: 4, topRight: 4 }}
              animate={{ type: "timing", duration: 500 }}
            />
          )}
        </CartesianChart>
      </View>
      <View style={styles.labelsRow}>
        {data
          .filter((_, i) => i % 2 === 0 || data.length <= 6)
          .map((point, index) => (
            <ThemedText key={index} style={styles.labelText}>
              {point.label}
            </ThemedText>
          ))}
      </View>
    </ThemedView>
  );
}

interface PeriodToggleProps {
  period: "week" | "month";
  onPeriodChange: (period: "week" | "month") => void;
  colorScheme: "light" | "dark";
}

function PeriodToggle({
  period,
  onPeriodChange,
  colorScheme,
}: PeriodToggleProps) {
  const activeColor = Colors[colorScheme].tint;
  const inactiveColor = colorScheme === "dark" ? "#4b5563" : "#d1d5db";

  return (
    <View style={styles.toggleContainer}>
      <Pressable
        onPress={() => onPeriodChange("week")}
        style={[
          styles.toggleButton,
          { backgroundColor: period === "week" ? activeColor : inactiveColor },
        ]}
      >
        <ThemedText
          style={[
            styles.toggleText,
            { color: period === "week" ? "#fff" : Colors[colorScheme].text },
          ]}
        >
          Week
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={() => onPeriodChange("month")}
        style={[
          styles.toggleButton,
          { backgroundColor: period === "month" ? activeColor : inactiveColor },
        ]}
      >
        <ThemedText
          style={[
            styles.toggleText,
            { color: period === "month" ? "#fff" : Colors[colorScheme].text },
          ]}
        >
          Month
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  chartContainer: {
    height: 180,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  labelText: {
    fontSize: 10,
    opacity: 0.6,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    opacity: 0.6,
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
