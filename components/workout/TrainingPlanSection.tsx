import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCurrentWeekPlan } from "@/hooks/useTrainingPlan";
import { TrainingPlanDayWithDetails } from "@/database/types";
import { StyleSheet, View } from "react-native";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const RUN_TYPE_CONFIG: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  easy: { label: "Easy Run", icon: "🏃", color: "#4CAF50" },
  tempo: { label: "Tempo Run", icon: "⚡", color: "#FF9800" },
  intervals: { label: "Intervals", icon: "🔥", color: "#F44336" },
  long: { label: "Long Run", icon: "🛣️", color: "#9C27B0" },
  race: { label: "Race Day", icon: "🏁", color: "#FF6B35" },
};

function PlanDayRow({ day }: { day: TrainingPlanDayWithDetails }) {
  const border = useThemeColor(
    { light: "rgba(74,144,226,0.15)", dark: "rgba(255,255,255,0.08)" },
    "tint",
  );
  const todayDow = new Date().getDay();
  const isToday = day.day_of_week === todayDow;

  if (day.day_type === "rest") {
    return (
      <View
        style={[
          styles.row,
          { borderColor: border },
          isToday && styles.todayRow,
        ]}
      >
        <ThemedText style={styles.dayLabel}>
          {DAY_LABELS[day.day_of_week]}
        </ThemedText>
        <View style={styles.rowContent}>
          <ThemedText style={styles.restText}>😴 Rest</ThemedText>
        </View>
        {isToday && <View style={styles.todayDot} />}
      </View>
    );
  }

  if (day.day_type === "run" && day.run_target) {
    const config =
      RUN_TYPE_CONFIG[day.run_target.run_type] ?? RUN_TYPE_CONFIG.easy;
    return (
      <View
        style={[
          styles.row,
          { borderColor: border },
          isToday && styles.todayRow,
        ]}
      >
        <ThemedText style={styles.dayLabel}>
          {DAY_LABELS[day.day_of_week]}
        </ThemedText>
        <View style={styles.rowContent}>
          <View
            style={[styles.typeBadge, { backgroundColor: config.color + "22" }]}
          >
            <ThemedText style={[styles.badgeText, { color: config.color }]}>
              {config.icon} {config.label}
            </ThemedText>
          </View>
          <ThemedText style={styles.detail}>
            {day.run_target.distance_km} km
            {day.run_target.pace_note ? ` · ${day.run_target.pace_note}` : ""}
          </ThemedText>
        </View>
        {isToday && <View style={styles.todayDot} />}
      </View>
    );
  }

  if (day.day_type === "gym") {
    return (
      <View
        style={[
          styles.row,
          { borderColor: border },
          isToday && styles.todayRow,
        ]}
      >
        <ThemedText style={styles.dayLabel}>
          {DAY_LABELS[day.day_of_week]}
        </ThemedText>
        <View style={styles.rowContent}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: "rgba(74,144,226,0.15)" },
            ]}
          >
            <ThemedText
              style={[styles.badgeText, { color: "rgba(74,144,226,1)" }]}
            >
              🏋️ Gym
            </ThemedText>
          </View>
          {day.workout_title && (
            <ThemedText style={styles.detail}>{day.workout_title}</ThemedText>
          )}
        </View>
        {isToday && <View style={styles.todayDot} />}
      </View>
    );
  }

  return null;
}

export function TrainingPlanSection() {
  const { data, isLoading } = useCurrentWeekPlan();

  if (isLoading || !data) return null;

  const { plan, currentWeek, days } = data;

  const sortedDays = [...days].sort((a, b) => {
    const aDow = a.day_of_week === 0 ? 7 : a.day_of_week;
    const bDow = b.day_of_week === 0 ? 7 : b.day_of_week;
    return aDow - bDow;
  });

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">{plan.name}</ThemedText>
        <ThemedText style={styles.weekLabel}>
          Week {currentWeek} of {plan.total_weeks}
        </ThemedText>
      </View>
      <ThemedView style={styles.days}>
        {sortedDays.map((day) => (
          <PlanDayRow key={day.id} day={day} />
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 32 },
  header: {
    marginBottom: 12,
    gap: 2,
  },
  weekLabel: { opacity: 0.5, fontSize: 13 },
  days: { gap: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  todayRow: { borderColor: "#FF6B35" },
  todayDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF6B35",
  },
  dayLabel: { width: 34, fontSize: 13, fontWeight: "600", opacity: 0.6 },
  rowContent: { flex: 1, gap: 2 },
  typeBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  detail: { fontSize: 12, opacity: 0.6, marginTop: 1 },
  restText: { opacity: 0.4, fontSize: 13 },
});
