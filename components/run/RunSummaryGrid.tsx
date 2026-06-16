import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RunSessionService } from "@/database/services/runSessionService";
import { RunSession } from "@/database/types";

interface RunSummaryGridProps {
  run: RunSession;
}

interface Stat {
  label: string;
  value: string;
}

export function RunSummaryGrid({ run }: RunSummaryGridProps) {
  const stats: Stat[] = [
    {
      label: "Distance",
      value: RunSessionService.formatDistance(run.distance_m),
    },
    {
      label: "Moving Time",
      value: RunSessionService.formatDuration(run.duration_secs),
    },
    {
      label: "Avg Pace",
      value: run.avg_pace_secs_per_km
        ? RunSessionService.formatPace(run.avg_pace_secs_per_km)
        : "—",
    },
    {
      label: "Avg HR",
      value: run.avg_hr ? `${Math.round(run.avg_hr)} bpm` : "—",
    },
    {
      label: "Max HR",
      value: run.max_hr ? `${Math.round(run.max_hr)} bpm` : "—",
    },
    {
      label: "Elevation",
      value:
        run.total_elevation_gain != null
          ? `${Math.round(run.total_elevation_gain)} m`
          : "—",
    },
    {
      label: "Avg Cadence",
      value: run.avg_cadence ? `${Math.round(run.avg_cadence * 2)} spm` : "—",
    },
    {
      label: "Relative Effort",
      value: run.suffer_score != null ? `${run.suffer_score}` : "—",
    },
  ];

  return (
    <ThemedView style={styles.grid}>
      {stats.map((stat) => (
        <ThemedView key={stat.label} style={styles.cell}>
          <ThemedText style={styles.value}>{stat.value}</ThemedText>
          <ThemedText style={styles.label}>{stat.label}</ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  cell: {
    width: "50%",
    paddingVertical: 12,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FC4C02",
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
