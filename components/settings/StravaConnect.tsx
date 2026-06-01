import { StravaService } from "@/services/stravaService";
import { ThemedText } from "@/components/ThemedText";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function StravaConnect() {
  const [connected, setConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const refresh = async () => {
    const [isConnected, lastPull] = await Promise.all([
      StravaService.isConnected(),
      StravaService.getLastPullDate(),
    ]);
    setConnected(isConnected);
    setLastSync(lastPull ? lastPull.toLocaleString() : null);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const ok = await StravaService.connect();
      if (ok) {
        await refresh();
        Alert.alert(
          "Connected!",
          "Strava connected. Your runs will sync automatically when you open the app.",
        );
      } else {
        Alert.alert("Cancelled", "Strava connection was cancelled.");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to connect to Strava.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      "Disconnect Strava",
      "This will stop syncing your runs. Your existing run history will remain.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            await StravaService.disconnect();
            await refresh();
          },
        },
      ],
    );
  };

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      const count = await StravaService.syncActivities();
      await refresh();
      Alert.alert(
        "Synced",
        `Imported ${count} new run${count === 1 ? "" : "s"} from Strava.`,
      );
    } catch (err) {
      Alert.alert(
        "Sync Failed",
        err instanceof Error ? err.message : "Could not sync with Strava.",
      );
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#FC4C02" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.stravaIcon}>🟠</ThemedText>
        <View style={styles.headerText}>
          <ThemedText style={styles.title}>Strava</ThemedText>
          <ThemedText style={styles.status}>
            {connected
              ? `Connected · Last sync: ${lastSync ?? "never"}`
              : "Not connected"}
          </ThemedText>
        </View>
        <View
          style={[
            styles.dot,
            { backgroundColor: connected ? "#4CAF50" : "#555" },
          ]}
        />
      </View>

      {connected ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.syncButton]}
            onPress={handleManualSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <ThemedText style={styles.buttonText}>Sync Now</ThemedText>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.disconnectButton]}
            onPress={handleDisconnect}
          >
            <ThemedText style={styles.disconnectText}>Disconnect</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.connectButton]}
          onPress={handleConnect}
        >
          <ThemedText style={styles.buttonText}>Connect Strava</ThemedText>
        </TouchableOpacity>
      )}

      <ThemedText style={styles.hint}>
        Runs sync automatically each time you open the app. Only Run activity
        types are imported.
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  stravaIcon: { fontSize: 24, marginRight: 10 },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: "bold" },
  status: { fontSize: 12, color: "#888", marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  actions: { flexDirection: "row", gap: 10, marginBottom: 10 },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  connectButton: { backgroundColor: "#FC4C02" },
  syncButton: { backgroundColor: "#FC4C02" },
  disconnectButton: { backgroundColor: "#333" },
  buttonText: { color: "white", fontWeight: "600", fontSize: 14 },
  disconnectText: { color: "#aaa", fontWeight: "600", fontSize: 14 },
  hint: { color: "#555", fontSize: 12, lineHeight: 18 },
});
