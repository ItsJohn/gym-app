import { useFont } from "@shopify/react-native-skia";
import React from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { CartesianChart, Line } from "victory-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { WeightProgressionPoint } from "@/hooks/useExerciseStats";

interface WeightProgressionChartProps {
  data: WeightProgressionPoint[];
  isLoading: boolean;
  exerciseName?: string;
  variant?: "default" | "onBlue";
  weightUnit?: "kg" | "lbs";
}

const spaceMono = require("@/assets/fonts/SpaceMono-Regular.ttf");

export function WeightProgressionChart({
  data,
  isLoading,
  exerciseName,
  variant = "default",
  weightUnit = "kg",
}: WeightProgressionChartProps) {
  const colorScheme = useColorScheme() === "dark" ? "dark" : "light";
  const font = useFont(spaceMono, 12);
  const isOnBlue = variant === "onBlue";

  const lineColor = isOnBlue
    ? "#ffffff"
    : colorScheme === "dark"
      ? "#4ade80"
      : "#16a34a";
  const labelColor = isOnBlue
    ? "rgba(255,255,255,0.85)"
    : colorScheme === "dark"
      ? "#ccc"
      : "#333";
  const axisColor = isOnBlue
    ? "rgba(255,255,255,0.3)"
    : colorScheme === "dark"
      ? "#555"
      : "#ccc";

  const Container = isOnBlue ? View : ThemedView;
  const TitleText = isOnBlue
    ? ({ style, children }: { style?: object; children: React.ReactNode }) => (
        <Text style={[{ color: "white" }, style]}>{children}</Text>
      )
    : ThemedText;

  if (isLoading || !font) {
    return (
      <Container style={styles.container}>
        <TitleText style={styles.title}>Weight Progression</TitleText>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      </Container>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Container style={styles.container}>
        <TitleText style={styles.title}>Weight Progression</TitleText>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: labelColor }]}>
            {exerciseName
              ? "No weight data recorded for this exercise yet"
              : "Select an exercise to view weight progression"}
          </Text>
        </View>
      </Container>
    );
  }

  const chartData = data.map((point, index) => ({
    x: index,
    weight: point.weight,
  }));

  const weights = chartData.map((d) => d.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const pad = Math.max((maxW - minW) * 0.25, 5);
  const domain = { y: [minW - pad, maxW + pad] as [number, number] };

  return (
    <Container style={styles.container}>
      {!isOnBlue && (
        <>
          <ThemedText type="subtitle" style={styles.title}>
            Weight Progression
          </ThemedText>
          {exerciseName && (
            <ThemedText style={styles.exerciseName}>{exerciseName}</ThemedText>
          )}
        </>
      )}
      <View style={styles.chartWrapper}>
        <View style={styles.yLabelContainer}>
          <Text
            style={[
              styles.axisLabel,
              { transform: [{ rotate: "-90deg" }], color: labelColor },
            ]}
          >
            {weightUnit}
          </Text>
        </View>
        <View style={styles.chartInner}>
          <View style={styles.chartContainer}>
            <CartesianChart
              data={chartData}
              xKey="x"
              yKeys={["weight"] as const}
              axisOptions={{ font, labelColor, lineColor: axisColor }}
              domain={domain}
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
          <Text
            style={[styles.axisLabel, styles.xLabel, { color: labelColor }]}
          >
            Session
          </Text>
        </View>
      </View>
    </Container>
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
  chartWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  yLabelContainer: {
    width: 24,
    alignItems: "center",
  },
  chartInner: {
    flex: 1,
  },
  chartContainer: {
    height: 200,
  },
  axisLabel: {
    fontSize: 11,
    opacity: 0.75,
    textAlign: "center",
  },
  xLabel: {
    marginTop: 2,
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
