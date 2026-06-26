import { useFont } from "@shopify/react-native-skia";
import { StyleSheet, View } from "react-native";
import { Bar, CartesianChart, Line } from "victory-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";

const spaceMono = require("@/assets/fonts/SpaceMono-Regular.ttf");

export interface RunChartPoint {
  x: number;
  y: number;
  [key: string]: number;
}

interface RunSplitChartProps {
  title: string;
  subtitle?: string;
  data: RunChartPoint[];
  type: "bar" | "line";
  color: string;
}

export function RunSplitChart({
  title,
  subtitle,
  data,
  type,
  color,
}: RunSplitChartProps) {
  const colorScheme = useColorScheme() === "dark" ? "dark" : "light";
  const font = useFont(spaceMono, 11);

  if (!font || data.length === 0) {
    return null;
  }

  const labelColor = colorScheme === "dark" ? "#ccc" : "#444";

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
      <View style={styles.chart}>
        <CartesianChart
          data={data}
          xKey="x"
          yKeys={["y"] as const}
          domainPadding={{ left: 24, right: 24, top: 20, bottom: 8 }}
          axisOptions={{ font, labelColor, lineColor: "rgba(120,120,120,0.2)" }}
        >
          {({ points, chartBounds }) =>
            type === "bar" ? (
              <Bar
                points={points.y}
                chartBounds={chartBounds}
                color={color}
                roundedCorners={{ topLeft: 4, topRight: 4 }}
                animate={{ type: "timing", duration: 400 }}
              />
            ) : (
              <Line
                points={points.y}
                color={color}
                strokeWidth={2.5}
                curveType="catmullRom"
                animate={{ type: "timing", duration: 400 }}
              />
            )
          }
        </CartesianChart>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 8,
  },
  chart: {
    height: 200,
  },
});
