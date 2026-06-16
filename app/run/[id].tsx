import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  RunSplitChart,
  RunSplitsTable,
  RunSummaryGrid,
  type RunChartPoint,
} from "@/components/run";
import { useRunDetail } from "@/hooks/useRunDetail";

export default function RunDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const runId = Number(id);
  const { session, splits, isLoading } = useRunDetail(runId);

  const paceData = useMemo<RunChartPoint[]>(
    () =>
      splits
        .filter((s) => s.avg_pace_secs_per_km != null)
        .map((s) => ({ x: s.split_number, y: s.avg_pace_secs_per_km! })),
    [splits],
  );

  const hrData = useMemo<RunChartPoint[]>(
    () =>
      splits
        .filter((s) => s.avg_hr != null)
        .map((s) => ({ x: s.split_number, y: Math.round(s.avg_hr!) })),
    [splits],
  );

  const elevationData = useMemo<RunChartPoint[]>(() => {
    let cumulative = session?.elev_low ?? 0;
    return splits.map((s) => {
      cumulative += s.elevation_diff_m ?? 0;
      return { x: s.split_number, y: Math.round(cumulative) };
    });
  }, [splits, session]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FC4C02" />
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.center}>
        <ThemedText type="subtitle">Run not found</ThemedText>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backLink}>Go back</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const started = new Date(session.started_at);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          🏃 {session.name || "Run"}
        </ThemedText>
        <ThemedText style={styles.date}>
          {started.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          ·{" "}
          {started.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </ThemedText>

        <RunSummaryGrid run={session} />

        <RunSplitChart
          title="Pace"
          subtitle="Seconds per km, by split"
          data={paceData}
          type="bar"
          color="#FC4C02"
        />
        <RunSplitChart
          title="Heart Rate"
          subtitle="Average bpm, by split"
          data={hrData}
          type="line"
          color="#e63946"
        />
        <RunSplitChart
          title="Elevation"
          subtitle="Cumulative elevation (m)"
          data={elevationData}
          type="line"
          color="#2a9d8f"
        />

        <RunSplitsTable splits={splits} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  back: {
    fontSize: 16,
    color: "#FC4C02",
    fontWeight: "600",
  },
  backLink: {
    color: "#FC4C02",
    fontWeight: "600",
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  title: {
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 20,
  },
});
