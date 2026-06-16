import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RunSessionService } from "@/database/services/runSessionService";
import { RunSplit } from "@/database/types";

interface RunSplitsTableProps {
  splits: RunSplit[];
}

export function RunSplitsTable({ splits }: RunSplitsTableProps) {
  if (splits.length === 0) return null;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Splits
      </ThemedText>
      <ThemedView style={[styles.row, styles.headerRow]}>
        <ThemedText style={[styles.cell, styles.headerText, styles.kmCol]}>
          KM
        </ThemedText>
        <ThemedText style={[styles.cell, styles.headerText]}>Pace</ThemedText>
        <ThemedText style={[styles.cell, styles.headerText]}>HR</ThemedText>
        <ThemedText style={[styles.cell, styles.headerText]}>Elev</ThemedText>
      </ThemedView>
      {splits.map((split) => (
        <ThemedView key={split.id} style={styles.row}>
          <ThemedText style={[styles.cell, styles.kmCol]}>
            {split.split_number}
          </ThemedText>
          <ThemedText style={styles.cell}>
            {split.avg_pace_secs_per_km
              ? RunSessionService.formatPace(
                  split.avg_pace_secs_per_km,
                ).replace("/km", "")
              : "—"}
          </ThemedText>
          <ThemedText style={styles.cell}>
            {split.avg_hr ? Math.round(split.avg_hr) : "—"}
          </ThemedText>
          <ThemedText style={styles.cell}>
            {split.elevation_diff_m != null
              ? `${split.elevation_diff_m > 0 ? "+" : ""}${Math.round(
                  split.elevation_diff_m,
                )}m`
              : "—"}
          </ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(120, 120, 120, 0.12)",
  },
  headerRow: {
    borderBottomWidth: 2,
    borderBottomColor: "rgba(252, 76, 2, 0.3)",
  },
  cell: {
    flex: 1,
    fontSize: 14,
    textAlign: "right",
  },
  kmCol: {
    flex: 0.6,
    textAlign: "left",
  },
  headerText: {
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.6,
    textTransform: "uppercase",
  },
});
