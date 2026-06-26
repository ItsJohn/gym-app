import { useFont } from "@shopify/react-native-skia";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Bar, CartesianChart } from "victory-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { PersonalRecord } from "@/hooks/useAnalyticsData";
import { useColorScheme } from "@/hooks/useColorScheme";

interface PersonalRecordsChartProps {
  data: PersonalRecord[];
  isLoading: boolean;
}

const spaceMono = require("@/assets/fonts/SpaceMono-Regular.ttf");

export function PersonalRecordsChart({
  data,
  isLoading,
}: PersonalRecordsChartProps) {
  const colorScheme = useColorScheme() === "dark" ? "dark" : "light";
  const font = useFont(spaceMono, 12);

  if (isLoading || !font) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          Personal Records
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
          Personal Records
        </ThemedText>
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            Complete some workouts with weights to see your PRs
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const topRecords = data.slice(0, 8);

  const chartData = topRecords.map((record, index) => ({
    x: index,
    weight: record.weight,
  }));

  const barColor = colorScheme === "dark" ? "#f59e0b" : "#d97706";

  const chartHeight = Math.max(200, topRecords.length * 40);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Personal Records
      </ThemedText>
      <ThemedText style={styles.subtitle}>Top weights by exercise</ThemedText>
      <View style={[styles.chartContainer, { height: chartHeight }]}>
        <CartesianChart
          data={chartData ?? []}
          xKey="x"
          yKeys={["weight"] as const}
          domainPadding={{ left: 30, right: 30, top: 20 }}
          axisOptions={{ font }}
        >
          {({ points, chartBounds }) => (
            <Bar
              points={points.weight}
              chartBounds={chartBounds}
              color={barColor}
              roundedCorners={{ topLeft: 5, topRight: 5 }}
              animate={{ type: "timing", duration: 500 }}
            />
          )}
        </CartesianChart>
      </View>
      <View style={styles.legendContainer}>
        {topRecords.map((record) => (
          <View key={record.exerciseId} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: barColor }]} />
            <ThemedText style={styles.legendText} numberOfLines={1}>
              {record.exerciseName}: {record.weight}kg
            </ThemedText>
          </View>
        ))}
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
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  chartContainer: {
    minHeight: 200,
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
  legendContainer: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    maxWidth: 150,
  },
});
