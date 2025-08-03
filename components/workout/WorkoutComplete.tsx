import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSettings } from "@/contexts/SettingsContext";
import { useSessionSetStats } from "@/hooks";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface WorkoutCompleteProps {
  onFinish: () => void;
}

export default function WorkoutComplete({ onFinish }: WorkoutCompleteProps) {
  const { settings } = useSettings();
  const { sessionId } = useLocalSearchParams<{
    sessionId: string;
  }>();

  const { data: sessionStats, isLoading } = useSessionSetStats(
    parseInt(sessionId),
  );

  return (
    <ThemedView style={styles.completeContainer}>
      <ThemedText type="title" style={styles.completeTitle}>
        🎉 Workout Complete!
      </ThemedText>

      {!isLoading && sessionStats && (
        <View style={styles.statsContainer}>
          <ThemedText style={styles.statsTitle}>Session Summary</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {sessionStats.completed_sets}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Sets Completed</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {sessionStats.total_exercises}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Exercises</ThemedText>
            </View>
            {sessionStats.total_weight > 0 && (
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {Math.round(sessionStats.total_weight)} {settings.weightUnit}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Total Weight</ThemedText>
              </View>
            )}
            {sessionStats.total_reps > 0 && (
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {sessionStats.total_reps}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Total Reps</ThemedText>
              </View>
            )}
            {sessionStats.total_duration > 0 && (
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {Math.round(sessionStats.total_duration / 60)}m
                </ThemedText>
                <ThemedText style={styles.statLabel}>Total Duration</ThemedText>
              </View>
            )}
            {sessionStats.total_distance > 0 && (
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {Math.round(sessionStats.total_distance)}m
                </ThemedText>
                <ThemedText style={styles.statLabel}>Total Distance</ThemedText>
              </View>
            )}
          </View>
          <View style={styles.completionRateContainer}>
            <ThemedText style={styles.completionRateText}>
              Completion Rate: {Math.round(sessionStats.completion_rate)}%
            </ThemedText>
          </View>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>
            Loading session stats...
          </ThemedText>
        </View>
      )}

      <ThemedText style={styles.completeMessage}>
        Great job completing your workout! You&apos;ve finished all exercises.
      </ThemedText>

      <TouchableOpacity style={styles.finishButton} onPress={onFinish}>
        <ThemedText style={styles.finishButtonText}>Finish Workout</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  completeContainer: {
    alignItems: "center",
    padding: 40,
  },
  completeTitle: {
    fontSize: 32,
    marginBottom: 16,
    textAlign: "center",
  },
  statsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.2)",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  completionRateContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  completionRateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  loadingContainer: {
    marginBottom: 24,
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  completeMessage: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 24,
  },
  finishButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
  },
  finishButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
