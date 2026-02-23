import { StyleSheet } from "react-native";

import GymLogo from "@/components/GymLogo";
import { SessionsSection } from "@/components/history/SessionsSection";
import { StatsSection } from "@/components/history/StatsSection";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useHistoryData } from "@/hooks/useHistoryData";

export default function HistoryScreen() {
  const {
    stats,
    allActiveWorkoutSessions,
    isLoading,
    error,
    handleSessionPress,
  } = useHistoryData();

  if (isLoading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={<GymLogo />}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title">Loading...</ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  if (error) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={<GymLogo />}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title">Failed to load history</ThemedText>
          <ThemedText style={{ opacity: 0.7, marginTop: 8 }}>
            Please restart the app and try again.
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<GymLogo />}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Active Workouts History</ThemedText>
        </ThemedView>

        <StatsSection stats={stats} />

        <SessionsSection
          sessions={allActiveWorkoutSessions || []}
          totalWorkouts={stats.totalWorkouts}
          onSessionPress={handleSessionPress}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
