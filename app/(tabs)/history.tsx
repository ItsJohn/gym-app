import { useState } from "react";
import { StyleSheet } from "react-native";

import GymLogo from "@/components/GymLogo";
import { SessionsSection } from "@/components/history/SessionsSection";
import { StatsSection } from "@/components/history/StatsSection";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRecentSessions } from "@/hooks/session";
import { Session } from "@/validation/session";
import { router, useNavigation } from "expo-router";

interface SessionWithTitle extends Session {
  workout_title?: string;
}

export default function HistoryScreen() {
  const { data: sessions, isLoading: isSessionsLoading } =
    useRecentSessions(100);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalDuration: 0,
    averageDuration: 0,
    totalWorkouts: 0,
    currentStreak: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  // const loadData = useCallback(async () => {
  //   try {
  //     setError(null);

  //     // Calculate stats
  //     const totalSessions = sessions?.length || 0;
  //     const completedSessions = sessions?.filter((s) => s.is_completed).length || 0;

  //     // Calculate total duration from completed sessions
  //     let totalDurationMs = 0;
  //     sessions?.forEach((s) => {
  //       if (s.is_completed && s.completed_at && s.started_at) {
  //         const start = new Date(s.started_at);
  //         const end = new Date(s.completed_at);
  //         totalDurationMs += end.getTime() - start.getTime();
  //       }
  //     });

  //     const totalDuration = Math.floor(totalDurationMs / (1000 * 60)); // Convert to minutes
  //     const averageDuration =
  //       completedSessions > 0
  //         ? Math.round(totalDuration / completedSessions)
  //         : 0;

  //     // Get unique workout count
  //     const uniqueWorkoutIds = new Set(
  //       sessions?.map((s) => s.workout_id),
  //     );
  //     const totalWorkouts = uniqueWorkoutIds.size;

  //     // Calculate current streak (simplified - consecutive days with completed sessions)
  //     let currentStreak = 0;
  //     // const today = new Date();
  //     // const completedSessionsByDate = sessions
  //     //   ?.filter((s) => s.is_completed && s.started_at)
  //     //   .sort(
  //     //     (a, b) =>
  //     //       new Date(b.started_at!).getTime() - new Date(a.started_at!).getTime(),
  //     //   );

  //     // for (let i = 0; i < completedSessionsByDate.length; i++) {
  //     //   const sessionDate = new Date(completedSessionsByDate[i].started_at!);
  //     //   const daysDiff = Math.floor(
  //     //     (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24),
  //     //   );

  //     //   if (daysDiff === i) {
  //     //     currentStreak++;
  //     //   } else {
  //     //     break;
  //     //   }
  //     // }

  //     setStats({
  //       totalSessions,
  //       completedSessions,
  //       totalDuration,
  //       averageDuration,
  //       totalWorkouts,
  //       currentStreak,
  //     });
  //   } catch (err) {
  //     console.error("Error loading history data:", err);
  //     setError("Failed to load history data");
  //   }
  // }, []);

  // useEffect(() => {
  //   loadData();
  // }, [loadData]);

  const handleSessionPress = async (session: SessionWithTitle) => {
    router.push({
      pathname: "/workout",
      params: {
        workoutId: session.workout_id.toString(),
        sessionId: session.id?.toString(),
      },
    });
    //     try {
    //       if (!session.id) {
    //         Alert.alert("Error", "Invalid session ID");
    //         return;
    //       }

    //       // Get detailed session data including sets
    //       const sessionSets = await SessionService.getSetsBySessionId(session.id);

    //       Alert.alert(
    //         "Session Details",
    //         `Workout: ${session.workout_title || "Unknown"}
    // Start: ${session.started_at ? new Date(session.started_at).toLocaleString() : "Unknown"}
    // ${session.completed_at ? `End: ${new Date(session.completed_at).toLocaleString()}` : "Not finished"}
    // Status: ${session.is_completed ? "Completed" : "In Progress"}
    // Sets Completed: ${sessionSets.filter((set) => set.is_completed).length}/${sessionSets.length}
    // ${session.notes ? `Notes: ${session.notes}` : ""}`,
    //         [{ text: "OK" }],
    //       );
    //     } catch (err) {
    //       console.error("Error loading session details:", err);
    //       Alert.alert("Error", "Failed to load session details");
    //     }
  };

  if (isSessionsLoading) {
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
          <ThemedText type="title">Error</ThemedText>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          {/* <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity> */}
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
          <ThemedText type="title">Workout History</ThemedText>
        </ThemedView>

        <StatsSection stats={stats} />

        <SessionsSection
          sessions={sessions || []}
          totalWorkouts={8} //stats.totalWorkouts
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
  errorText: {
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 16,
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
