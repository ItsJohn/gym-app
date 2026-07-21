import { ThemedText } from "@/components/ThemedText";
import {
  EXPORT_WEEKS,
  FitnessExportService,
} from "@/services/fitnessExportService";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExportData() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const { strengthSessions, runs } =
        await FitnessExportService.exportAndShare();
      Alert.alert(
        "Export ready",
        `Exported ${strengthSessions} strength session${
          strengthSessions === 1 ? "" : "s"
        } and ${runs} run${
          runs === 1 ? "" : "s"
        }. Share it to yourself, then upload the file to a Claude Project.`,
      );
    } catch (err) {
      Alert.alert(
        "Export failed",
        err instanceof Error ? err.message : "Could not export your data.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleExport}
        disabled={exporting}
      >
        {exporting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <ThemedText style={styles.buttonText}>
            Export last {EXPORT_WEEKS} weeks
          </ThemedText>
        )}
      </TouchableOpacity>
      <ThemedText style={styles.hint}>
        Bundles your recent workouts and Strava runs into a Markdown file you
        can upload to a Claude Project for a full view of your training.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#4A90E2",
    marginBottom: 10,
  },
  buttonText: { color: "white", fontWeight: "600", fontSize: 14 },
  hint: { color: "#555", fontSize: 12, lineHeight: 18 },
});
