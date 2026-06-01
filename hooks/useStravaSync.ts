import { StravaService } from "@/services/stravaService";
import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export function useStravaSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncCount, setLastSyncCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sync = async () => {
    try {
      const needs = await StravaService.needsSync();
      if (!needs) return;
      setSyncing(true);
      setError(null);
      const count = await StravaService.syncActivities();
      setLastSyncCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Strava sync failed");
    } finally {
      setSyncing(false);
    }
  };

  // Sync on mount
  useEffect(() => {
    sync();
  }, []);

  // Sync when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") sync();
    });
    return () => sub.remove();
  }, []);

  return { syncing, lastSyncCount, error };
}
