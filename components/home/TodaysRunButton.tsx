import { RunSessionService } from "@/database/services/runSessionService";
import { ThemedText } from "@/components/ThemedText";
import { ActivePlanDay, RunSession } from "@/database/types";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

interface Props {
  planDay: ActivePlanDay;
}

const RUN_TYPE_LABELS: Record<string, string> = {
  easy: "Easy Run",
  tempo: "Tempo Run",
  intervals: "Intervals",
  long: "Long Run",
  race: "Race Day",
};

const RUN_TYPE_COLORS: Record<string, string> = {
  easy: "#4CAF50",
  tempo: "#FF9800",
  intervals: "#F44336",
  long: "#9C27B0",
  race: "#FF6B35",
};

export default function TodaysRunButton({ planDay }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [todaysRun, setTodaysRun] = useState<RunSession | null>(null);

  const runTarget = planDay.day.run_target;
  const runType = runTarget?.run_type ?? "easy";
  const color = RUN_TYPE_COLORS[runType] ?? "#4CAF50";

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  useEffect(() => {
    RunSessionService.getTodaysRun()
      .then(setTodaysRun)
      .catch(() => null);
  }, []);

  const isCompleted = !!todaysRun;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: pulseAnim }] }]}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: color, opacity: isCompleted ? 0.7 : 1 },
        ]}
      >
        <View style={styles.iconContainer}>
          <ThemedText style={styles.icon}>
            {isCompleted
              ? "✅"
              : runType === "easy"
                ? "🏃"
                : runType === "tempo"
                  ? "⚡"
                  : runType === "intervals"
                    ? "🔥"
                    : runType === "long"
                      ? "🛣️"
                      : "🏁"}
          </ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <ThemedText style={styles.label}>
              {isCompleted ? "Run Complete!" : "Today's Run"}
            </ThemedText>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>
                {RUN_TYPE_LABELS[runType]}
              </ThemedText>
            </View>
          </View>

          {runTarget && (
            <>
              <ThemedText style={styles.distance}>
                {runTarget.distance_km} km
              </ThemedText>
              {runTarget.pace_note && (
                <ThemedText style={styles.pace}>
                  {runTarget.pace_note}
                </ThemedText>
              )}
              {runTarget.notes && (
                <ThemedText style={styles.notes}>{runTarget.notes}</ThemedText>
              )}
            </>
          )}

          {isCompleted && todaysRun && (
            <ThemedText style={styles.completedText}>
              {RunSessionService.formatDistance(todaysRun.distance_m)} synced
              from Strava
              {todaysRun.avg_pace_secs_per_km
                ? ` · ${RunSessionService.formatPace(todaysRun.avg_pace_secs_per_km)}`
                : ""}
            </ThemedText>
          )}

          {!isCompleted && (
            <ThemedText style={styles.hint}>
              Syncs automatically from Strava
            </ThemedText>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  card: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  icon: { fontSize: 26 },
  content: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { color: "white", fontSize: 18, fontWeight: "bold" },
  badge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: "white", fontSize: 11, fontWeight: "600" },
  distance: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 2,
  },
  pace: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginBottom: 4 },
  notes: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },
  completedText: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 4 },
  hint: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 6 },
});
