import { useFont } from "@shopify/react-native-skia";
import React from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { CartesianChart, Line } from "victory-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { WeightProgressionPoint } from "@/hooks/useAnalyticsData";

interface WeightProgressionChartProps {
  data: WeightProgressionPoint[];
  isLoading: boolean;
  exerciseName?: string;
}

const spaceMono = require("@/assets/fonts/SpaceMono-Regular.ttf");

export function WeightProgressionChart({
  data,
  isLoading,
  exerciseName,
}: WeightProgressionChartProps) {
  const colorScheme = useColorScheme() ?? "light";
  const font = useFont(spaceMono, 12);

  if (isLoading || !font) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          Weight Progression
        </ThemedText>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      </ThemedView>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          Weight Progression
        </ThemedText>
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            {exerciseName
              ? "No weight data recorded for this exercise yet"
              : "Select an exercise to view weight progression"}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const chartData = data.map((point, index) => ({
    x: index,
    weight: point.weight,
  }));

  const lineColor = colorScheme === "dark" ? "#4ade80" : "#16a34a";

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Weight Progression
      </ThemedText>
      {exerciseName && (
        <ThemedText style={styles.exerciseName}>{exerciseName}</ThemedText>
      )}
      <View style={styles.chartContainer}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={["weight"] as const}
          axisOptions={{ font }}
        >
          {({ points }) => (
            <Line
              points={points.weight}
              color={lineColor}
              strokeWidth={3}
              curveType="catmullRom"
              animate={{ type: "timing", duration: 500 }}
            />
          )}
        </CartesianChart>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  chartContainer: {
    height: 200,
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
});
